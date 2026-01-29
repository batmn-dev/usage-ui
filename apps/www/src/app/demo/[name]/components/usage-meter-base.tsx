import { UsageMeterBase } from "@usage-ui/ui/components/registry/usage-meter";

export const usageMeterBase = {
  name: "usage-meter-base",
  components: {
    Default: <UsageMeterBase value={65} label="Storage" />,
    Success: <UsageMeterBase value={25} variant="success" label="API Calls" />,
    Warning: <UsageMeterBase value={75} variant="warning" label="Bandwidth" />,
    Danger: <UsageMeterBase value={95} variant="danger" label="Memory" />,
  },
};
