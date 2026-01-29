import { Squirrel } from "lucide-react";

export function RegistryLogo() {
  return (
    <>
      <div className="flex-shrink-0 rounded-md bg-primary p-1">
        <Squirrel className="size-5 text-secondary" />
      </div>
      <span className="text-xl font-medium tracking-tight">usage-ui</span>
    </>
  );
}
