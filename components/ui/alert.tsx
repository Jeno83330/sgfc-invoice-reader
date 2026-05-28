"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
}

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({ children, variant = "info", className, ...props }: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-lg border text-sm",
        variant === "info" && "bg-primary/5 border-primary/20 text-primary",
        variant === "success" && "bg-success/5 border-success/20 text-success",
        variant === "warning" && "bg-warning/5 border-warning/20 text-warning",
        variant === "error" && "bg-destructive/5 border-destructive/20 text-destructive",
        className
      )}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
