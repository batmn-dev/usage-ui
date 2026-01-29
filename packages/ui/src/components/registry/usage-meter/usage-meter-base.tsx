"use client";

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

interface UsageMeterBaseProps extends React.HTMLAttributes<HTMLDivElement> {
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

const UsageMeterBase = React.forwardRef<HTMLDivElement, UsageMeterBaseProps>(
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
    // Guard against max being 0 or negative to avoid NaN/Infinity
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
    const clampedPercentage = Math.min(100, Math.max(0, percentage));

    return (
      <div data-slot="usage-meter-base-root" className="w-full">
        {(label || showPercentage) && (
          <div
            data-slot="usage-meter-base-header"
            className="mb-1.5 flex items-center justify-between text-sm"
          >
            {label && (
              <span
                data-slot="usage-meter-base-label"
                className="font-medium text-foreground"
              >
                {label}
              </span>
            )}
            {showPercentage && (
              <span
                data-slot="usage-meter-base-percentage"
                className="text-muted-foreground tabular-nums"
              >
                {clampedPercentage}%
              </span>
            )}
          </div>
        )}
        <div
          ref={ref}
          data-slot="usage-meter-base"
          role="progressbar"
          tabIndex={0}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuetext={`${clampedPercentage}%`}
          aria-label={label}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-secondary",
            meterSizes[size],
            className,
          )}
          {...props}
        >
          <div
            data-slot="usage-meter-base-indicator"
            className={cn(
              "h-full transition-all duration-300 ease-in-out",
              meterVariants[variant],
            )}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      </div>
    );
  },
);
UsageMeterBase.displayName = "UsageMeterBase";

export {
  UsageMeterBase,
  meterVariants as meterBaseVariants,
  meterSizes as meterBaseSizes,
};
export type { UsageMeterBaseProps };
