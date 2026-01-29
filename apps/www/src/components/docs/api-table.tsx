import { cn } from "@/lib/utils";

interface ApiTableProps {
  data: Array<{
    prop: string;
    type: string;
    default?: string;
    description?: string;
  }>;
  className?: string;
}

export function ApiTable({ data, className }: ApiTableProps) {
  return (
    <div
      className={cn(
        "not-prose relative w-full overflow-auto rounded-lg border text-sm",
        className,
      )}
    >
      <table className="w-full">
        <thead className="bg-secondary text-foreground">
          <tr className="h-10">
            <th className="px-4 pb-0 text-left align-middle font-[450]">
              Prop
            </th>
            <th className="px-4 pb-0 text-left align-middle font-[450]">
              Type
            </th>
            <th className="px-4 pb-0 text-left align-middle font-[450]">
              Default
            </th>
            {data.some((row) => row.description) && (
              <th className="px-4 pb-0 text-left align-middle font-[450]">
                Description
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr key={row.prop} className="h-10">
              <td className="px-4 py-2 text-left align-middle font-mono text-sm">
                {row.prop}
              </td>
              <td className="px-4 py-2 text-left align-middle font-mono text-muted-foreground text-sm">
                {row.type}
              </td>
              <td className="px-4 py-2 text-left align-middle font-mono text-sm">
                {row.default ?? "—"}
              </td>
              {data.some((r) => r.description) && (
                <td className="px-4 py-2 text-left align-middle">
                  {row.description}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
