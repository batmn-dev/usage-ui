import { UsageMeter } from "@usage-ui/ui/components/registry/usage-meter";

export const usageMeter = {
  name: "usage-meter",
  components: {
    Default: <UsageMeter value={65} label="Storage" />,
    Success: <UsageMeter value={25} variant="success" label="API Calls" />,
    Warning: <UsageMeter value={75} variant="warning" label="Bandwidth" />,
    Danger: <UsageMeter value={95} variant="danger" label="Memory" />,
  },
};
