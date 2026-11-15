import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-sm border border-dashed border-border bg-card/40 my-4",
        className
      )}
    >
      <div className="w-8 h-8 rounded-sm border border-border flex items-center justify-center mb-3 text-muted-foreground/60 font-mono text-xs">
        §
      </div>
      <h3 className="font-serif text-base font-medium text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-sm font-sans leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
