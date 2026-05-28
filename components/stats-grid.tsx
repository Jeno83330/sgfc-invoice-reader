"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, FileCheck, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "primary";
  suffix?: string;
}

function StatCard({ label, value, icon, variant = "default", suffix }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </p>
          <p
            className={cn(
              "text-2xl font-bold tracking-tight",
              variant === "success" && "text-success",
              variant === "warning" && "text-warning",
              variant === "primary" && "text-primary",
              variant === "default" && "text-foreground"
            )}
          >
            {value}
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            variant === "success" && "bg-success/10",
            variant === "warning" && "bg-warning/10",
            variant === "primary" && "bg-primary/10",
            variant === "default" && "bg-muted"
          )}
        >
          {icon}
        </div>
      </div>
      
      {/* Subtle gradient accent */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1",
          variant === "success" && "bg-gradient-to-r from-success/50 to-transparent",
          variant === "warning" && "bg-gradient-to-r from-warning/50 to-transparent",
          variant === "primary" && "bg-gradient-to-r from-primary/50 to-transparent",
          variant === "default" && "bg-gradient-to-r from-muted to-transparent"
        )}
      />
    </div>
  );
}

interface StatsGridProps {
  extractedCount: number;
  totalHT: number;
  errorCount: number;
}

export function StatsGrid({ extractedCount, totalHT, errorCount }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatCard
        label="Factures extraites"
        value={extractedCount}
        icon={<FileCheck className="h-5 w-5 text-primary" />}
        variant="primary"
      />
      <StatCard
        label="Total HT"
        value={formatCurrency(totalHT)}
        icon={<TrendingUp className="h-5 w-5 text-success" />}
        variant="success"
      />
      <StatCard
        label="Erreurs"
        value={errorCount}
        icon={<AlertTriangle className="h-5 w-5 text-warning" />}
        variant={errorCount > 0 ? "warning" : "default"}
      />
    </div>
  );
}
