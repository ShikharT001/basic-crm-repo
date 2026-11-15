import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options?: Array<{ label: string; value: string | number }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-foreground",
            "transition-colors duration-150 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat bg-[right_10px_center]",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundSize: "12px",
          }}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p className="mt-1 text-[11px] text-destructive font-sans">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
