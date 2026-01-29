import { demos } from "@/app/demo/[name]";
import {
  ApiTable,
  ComponentCodePreview,
  ComponentNav,
  ComponentPreview,
  InstallationTabs,
  PreviewErrorBoundary,
} from "@/components/docs";
import { getComponentSource } from "@/lib/code";
import {
  type Component,
  getRegistryItem,
  getRegistryItems,
} from "@/lib/registry";
import { highlightCode } from "@/lib/shiki";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const items = getRegistryItems();
  return items.map((item) => ({ slug: item.name }));
}

// Return 404 for slugs not in generateStaticParams instead of attempting runtime render
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const component = getRegistryItem(slug);
    return {
      title: `${component.title} | Usage UI`,
      description: component.description,
    };
  } catch {
    notFound();
  }
}

export default async function ComponentDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let component: Component;
  try {
    component = getRegistryItem(slug);
  } catch {
    notFound();
  }

  const sourceCode = getComponentSource(slug);
  const codeHtml = await highlightCode(sourceCode, "tsx");
  const componentType = component.type as
    | "registry:component"
    | "registry:block"
    | "registry:ui";

  return (
    <>
      {/* Header */}
      <h1 className="scroll-m-20 font-semibold text-3xl tracking-tight">
        {component.title}
      </h1>
      {component.description && (
        <p className="mt-2 text-lg text-muted-foreground">
          {component.description}
        </p>
      )}

      {/* Examples Section */}
      <h2 className="mt-12 scroll-m-20 border-b pb-2 font-medium text-xl tracking-tight">
        Examples
      </h2>

      <h3 className="mt-8 scroll-m-20 font-medium text-lg tracking-tight">
        Basic
      </h3>
      <div className="mt-4">
        <ComponentCodePreview name={slug} code={sourceCode} codeHtml={codeHtml}>
          <PreviewErrorBoundary>
            <ComponentPreview
              name={slug}
              type={
                componentType === "registry:ui"
                  ? "registry:component"
                  : componentType
              }
            >
              {/* Dynamic preview rendered via iframe for blocks */}
              {componentType !== "registry:block" && demos[slug] && (
                <iframe
                  src={`/demo/${slug}`}
                  className="h-[350px] w-full rounded-md border-0"
                  title={`${slug} preview`}
                />
              )}
            </ComponentPreview>
          </PreviewErrorBoundary>
        </ComponentCodePreview>
      </div>

      {/* Installation Section */}
      <h2 className="mt-12 scroll-m-20 border-b pb-2 font-medium text-xl tracking-tight">
        Installation
      </h2>
      <div className="mt-4">
        <InstallationTabs componentName={slug} />
      </div>

      {/* API Reference Section */}
      <h2 className="mt-12 scroll-m-20 border-b pb-2 font-medium text-xl tracking-tight">
        API Reference
      </h2>

      <h3 className="mt-8 scroll-m-20 font-medium text-lg tracking-tight">
        {component.title}
      </h3>

      <div className="mt-4">
        <ApiTable
          data={[
            {
              prop: "className",
              type: "string",
              default: "—",
              description: "Additional CSS classes to apply",
            },
            {
              prop: "...props",
              type: "ComponentProps",
              default: "—",
              description: "All other props are passed to the root element",
            },
          ]}
        />
      </div>

      {/* Navigation */}
      <ComponentNav currentName={slug} />
    </>
  );
}
