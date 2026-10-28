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
}

export default function RangeSlider({ value, min, max, step = 1, onChange, ariaLabel, testId, className }: RangeSliderProps) {
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
      onChange={(event) => onChange(Number(event.target.value))}
      className={cn("h-6 w-full accent-primary", className)}
      style={{ "--fl-fill": `${fill}%` } as React.CSSProperties}
    />
  );
}
