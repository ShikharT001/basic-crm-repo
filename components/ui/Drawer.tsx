"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = "lg",
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const widthClasses = {
    md: "max-w-md",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onOpenChange(false);
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "w-full h-full bg-card border-l border-border shadow-dropdown flex flex-col",
          "animate-in slide-in-from-right duration-200",
          widthClasses[width]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border bg-card">
          <div>
            <h2 className="font-serif text-lg font-medium text-foreground tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground font-sans">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-border bg-card flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
