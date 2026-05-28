"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive";
}

export function Card({ children, className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6",
        variant === "interactive" && "hover:border-muted-foreground/50 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export function CardHeader({ icon, title, description, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start gap-4 mb-6", className)} {...props}>
      {icon && (
        <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
