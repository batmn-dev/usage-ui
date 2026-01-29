"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

const meterVariants = {
  default: "bg-primary",
  success: "bg-[--meter-success]",
  warning: "bg-[--meter-warning]",
  danger: "bg-[--meter-danger]",
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
    const percentage = Math.round((value / max) * 100);
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
          max={max}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-[--meter-track]",
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
