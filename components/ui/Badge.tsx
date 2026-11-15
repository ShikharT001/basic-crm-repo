import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "brass" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    neutral:
      "bg-muted/50 text-muted-foreground border-border",
    brass:
      "bg-accent/10 text-accent border-accent/40 font-medium",
    success:
      "bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/30",
    warning:
      "bg-amber-950/10 text-amber-700 dark:text-amber-400 border-amber-600/30",
    danger:
      "bg-destructive/10 text-destructive border-destructive/30",
    info:
      "bg-sky-950/10 text-sky-700 dark:text-sky-400 border-sky-600/30",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px] tracking-tight",
    md: "px-2 py-0.5 text-[11px] tracking-tight",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-mono uppercase tracking-wider rounded-[2px] border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
