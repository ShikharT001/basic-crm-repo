import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost" | "brass";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none rounded-sm select-none";

    const variantStyles = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary active:scale-[0.99]",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border active:scale-[0.99]",
      outline:
        "bg-transparent text-foreground hover:bg-muted/60 border border-border active:scale-[0.99]",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive active:scale-[0.99]",
      ghost:
        "bg-transparent text-foreground hover:bg-muted/70 active:scale-[0.99]",
      brass:
        "bg-accent text-accent-foreground hover:bg-accent/90 border border-accent active:scale-[0.99]",
    };

    const sizeStyles = {
      sm: "h-8 px-2.5 text-xs tracking-tight",
      md: "h-9 px-3.5 text-xs font-medium tracking-tight",
      lg: "h-11 px-5 text-sm font-medium tracking-tight",
      icon: "h-9 w-9 p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
