import type * as React from "react";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  ariaLabel: string;
  testId?: string;
  className?: string;
  disabled?: boolean;
}

export default function RangeSlider({ value, min, max, step = 1, onChange, ariaLabel, testId, className, disabled }: RangeSliderProps) {
  const fill = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      data-testid={testId}
      disabled={disabled}
      onChange={(event) => onChange(Number(event.target.value))}
      className={cn("h-6 w-full accent-primary disabled:cursor-not-allowed disabled:opacity-60", className)}
      style={{ "--fl-fill": `${fill}%` } as React.CSSProperties}
    />
  );
}
