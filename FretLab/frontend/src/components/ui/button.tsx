import type * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "icon-lg";
  size?: "default" | "sm" | "lg" | "icon-lg";
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  const variantClass = {
    default: "bg-primary text-primary-foreground hover:opacity-90",
    outline: "border border-border bg-background text-foreground hover:bg-secondary",
    secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
    ghost: "text-foreground hover:bg-secondary",
    "icon-lg": "bg-transparent text-foreground hover:bg-secondary",
  }[variant];
  const sizeClass = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-5",
    "icon-lg": "h-12 w-12 rounded-xl p-0",
  }[size];

  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", variantClass, sizeClass, className)} {...props} />;
}
