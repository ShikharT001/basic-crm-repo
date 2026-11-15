import React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border mb-6",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-serif text-2xl font-normal text-foreground tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground font-sans">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
