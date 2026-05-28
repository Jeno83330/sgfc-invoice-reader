"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  FileSpreadsheet,
  Receipt,
  Sparkles,
  Download,
  Check,
} from "lucide-react";

interface Step {
  id: number;
  label: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { id: 1, label: "Template", icon: <FileSpreadsheet className="h-4 w-4" /> },
  { id: 2, label: "Factures", icon: <Receipt className="h-4 w-4" /> },
  { id: 3, label: "Extraction", icon: <Sparkles className="h-4 w-4" /> },
  { id: 4, label: "Export", icon: <Download className="h-4 w-4" /> },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300",
                isCompleted && "bg-success/10 text-success",
                isCurrent && "bg-primary/10 text-primary",
                !isCompleted && !isCurrent && "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium transition-all duration-300",
                  isCompleted && "bg-success text-success-foreground",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : step.id}
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 transition-all duration-300",
                  currentStep > step.id ? "bg-success" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
