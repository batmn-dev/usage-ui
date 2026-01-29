"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

const meterVariants = {
  default: "bg-primary",
  success: "bg-chart-2",
  warning: "bg-chart-4",
  danger: "bg-destructive",
} as const;

const meterSizes = {
  sm: "h-2",
  default: "h-3",
  lg: "h-4",
} as const;

interface UsageMeterProps
  extends Omit<
    React.ComponentProps<typeof ProgressPrimitive.Root>,
    "value" | "max"
  > {
  /** Current value (required) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Visual variant */
  variant?: keyof typeof meterVariants;
  /** Size variant */
  size?: keyof typeof meterSizes;
  /** Optional label text */
  label?: string;
  /** Show percentage (default: true) */
  showPercentage?: boolean;
}

const UsageMeter = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  UsageMeterProps
>(
  (
    {
      className,
      value,
      max = 100,
      variant = "default",
      size = "default",
      label,
      showPercentage = true,
      ...props
    },
    ref,
  ) => {
    // Guard against max <= 0 to prevent division by zero and invalid progress state
    const safeMax = Math.max(1, max);
    const percentage = Math.round((value / safeMax) * 100);
    const clampedPercentage = Math.min(100, Math.max(0, percentage));

    return (
      <div data-slot="usage-meter-root" className="w-full">
        {(label || showPercentage) && (
          <div
            data-slot="usage-meter-header"
            className="mb-1.5 flex items-center justify-between text-sm"
          >
            {label && (
              <span
                data-slot="usage-meter-label"
                className="font-medium text-foreground"
              >
                {label}
              </span>
            )}
            {showPercentage && (
              <span
                data-slot="usage-meter-percentage"
                className="text-muted-foreground tabular-nums"
              >
                {clampedPercentage}%
              </span>
            )}
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          data-slot="usage-meter"
          value={value}
          max={safeMax}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-secondary",
            meterSizes[size],
            className,
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            data-slot="usage-meter-indicator"
            className={cn(
              "h-full w-full flex-1 transition-all duration-300 ease-in-out",
              meterVariants[variant],
            )}
            style={{ transform: `translateX(-${100 - clampedPercentage}%)` }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  },
);
UsageMeter.displayName = "UsageMeter";

export { UsageMeter, meterVariants, meterSizes };
export type { UsageMeterProps };
