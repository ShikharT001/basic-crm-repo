import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[70px] w-full rounded-sm border border-border bg-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/70",
            "transition-colors duration-150 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
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

Textarea.displayName = "Textarea";
