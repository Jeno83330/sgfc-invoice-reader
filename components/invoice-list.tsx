"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, Image, X, Loader2 } from "lucide-react";

interface InvoiceFile {
  file: File;
  name: string;
  status: "pending" | "processing" | "success" | "error";
}

interface InvoiceListProps {
  invoices: InvoiceFile[];
  onRemove: (index: number) => void;
}

export function InvoiceList({ invoices, onRemove }: InvoiceListProps) {
  if (invoices.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      {invoices.map((invoice, index) => {
        const isPdf = invoice.name.toLowerCase().endsWith(".pdf");

        return (
          <div
            key={`${invoice.name}-${index}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200",
              invoice.status === "success" && "border-success/30 bg-success/5",
              invoice.status === "error" && "border-destructive/30 bg-destructive/5",
              invoice.status === "pending" && "border-border bg-card hover:bg-muted/30",
              invoice.status === "processing" && "border-primary/30 bg-primary/5"
            )}
          >
            <div
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                invoice.status === "success" && "bg-success/10",
                invoice.status === "error" && "bg-destructive/10",
                invoice.status === "pending" && "bg-muted",
                invoice.status === "processing" && "bg-primary/10"
              )}
            >
              {invoice.status === "processing" ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : isPdf ? (
                <FileText
                  className={cn(
                    "h-4 w-4",
                    invoice.status === "success" && "text-success",
                    invoice.status === "error" && "text-destructive",
                    invoice.status === "pending" && "text-muted-foreground"
                  )}
                />
              ) : (
                <Image
                  className={cn(
                    "h-4 w-4",
                    invoice.status === "success" && "text-success",
                    invoice.status === "error" && "text-destructive",
                    invoice.status === "pending" && "text-muted-foreground"
                  )}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {invoice.name}
              </p>
              <p
                className={cn(
                  "text-xs",
                  invoice.status === "success" && "text-success",
                  invoice.status === "error" && "text-destructive",
                  invoice.status === "pending" && "text-muted-foreground",
                  invoice.status === "processing" && "text-primary"
                )}
              >
                {invoice.status === "pending" && "En attente"}
                {invoice.status === "processing" && "Analyse en cours..."}
                {invoice.status === "success" && "Extrait avec succes"}
                {invoice.status === "error" && "Erreur de lecture"}
              </p>
            </div>

            {invoice.status === "pending" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export type { InvoiceFile };
