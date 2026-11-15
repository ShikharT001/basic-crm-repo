import React from "react";
import { cn } from "@/lib/utils";

export interface StatCellProps {
  label: string;
  value: string | number;
  subValue?: string;
  contextText?: string;
  isMono?: boolean;
  className?: string;
}

export function StatCell({
  label,
  value,
  subValue,
  contextText,
  isMono = true,
  className,
}: StatCellProps) {
  return (
    <div
      className={cn(
        "p-4 bg-card border border-border rounded-sm flex flex-col justify-between transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="micro-label">{label}</span>
        {subValue && (
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
            {subValue}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span
          className={cn(
            "text-2xl font-serif text-foreground tracking-tight leading-none",
            isMono && "tabular-nums"
          )}
        >
          {value}
        </span>
      </div>

      {contextText && (
        <div className="mt-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground font-sans">
          {contextText}
        </div>
      )}
    </div>
  );
}
