"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "md",
}: DialogProps) {
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

  const maxWidths = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-[2px] animate-in fade-in duration-150"
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
          "w-full rounded-sm border border-border bg-card p-6 shadow-dropdown",
          "animate-in zoom-in-95 duration-150 relative",
          maxWidths[maxWidth]
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4">
          <h2 className="font-serif text-lg font-medium text-foreground tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground font-sans">
              {description}
            </p>
          )}
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} maxWidth="sm">
      <div className="text-xs text-muted-foreground leading-relaxed mb-6 font-sans">
        {description}
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          size="sm"
          isLoading={isLoading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
