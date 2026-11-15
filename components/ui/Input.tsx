import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  isMono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, isMono = false, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70",
            "transition-colors duration-150 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isMono && "font-mono tabular-nums tracking-tight",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[11px] text-destructive font-sans">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
