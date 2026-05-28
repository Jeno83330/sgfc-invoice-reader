"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LIGNES_BUDGETAIRES, type ExtractedRow } from "@/lib/constants";
import { AlertCircle, Edit3 } from "lucide-react";

interface DataTableProps {
  rows: ExtractedRow[];
  onRowUpdate: (index: number, field: keyof ExtractedRow, value: string | number | null) => void;
}

export function DataTable({ rows, onRowUpdate }: DataTableProps) {
  const validRows = rows.filter((r) => !r._error);
  const errorRows = rows.filter((r) => r._error);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Fichier
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Fournisseur
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                N Facture
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Objet
              </th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Montant HT
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Ligne budg.
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Mois
              </th>
            </tr>
          </thead>
          <tbody>
            {validRows.map((row, index) => {
              const originalIndex = rows.indexOf(row);
              return (
                <tr
                  key={`row-${index}`}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground truncate max-w-[120px] block">
                      {row._filename || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell
                      value={row.date || ""}
                      onChange={(val) => onRowUpdate(originalIndex, "date", val || null)}
                      className="w-20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell
                      value={row.fournisseur || ""}
                      onChange={(val) => onRowUpdate(originalIndex, "fournisseur", val || null)}
                      className="w-32"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell
                      value={row.numero_facture || ""}
                      onChange={(val) => onRowUpdate(originalIndex, "numero_facture", val || null)}
                      className="w-24"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell
                      value={row.objet || ""}
                      onChange={(val) => onRowUpdate(originalIndex, "objet", val || null)}
                      className="w-40"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell
                      value={row.montant_ht?.toString() || ""}
                      onChange={(val) => onRowUpdate(originalIndex, "montant_ht", val ? parseFloat(val) : null)}
                      className="w-24 text-right"
                      type="number"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.ligne_budgetaire?.toString() || ""}
                      onChange={(e) =>
                        onRowUpdate(originalIndex, "ligne_budgetaire", e.target.value ? parseInt(e.target.value) : null)
                      }
                      className="w-full bg-transparent border border-transparent hover:border-border focus:border-primary rounded-md px-2 py-1.5 text-sm outline-none transition-colors cursor-pointer"
                    >
                      <option value="">-</option>
                      {Object.entries(LIGNES_BUDGETAIRES).map(([key, label]) => (
                        <option key={key} value={key} className="bg-card">
                          {key} - {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <EditableCell
                      value={row.mois || ""}
                      onChange={(val) => onRowUpdate(originalIndex, "mois", val || null)}
                      className="w-20"
                    />
                  </td>
                </tr>
              );
            })}
            {errorRows.map((row, index) => (
              <tr key={`error-${index}`} className="bg-destructive/5">
                <td colSpan={8} className="px-4 py-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">{row._filename}</span>
                    <span className="text-destructive/70">- {row._error}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface EditableCellProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  type?: "text" | "number";
}

function EditableCell({ value, onChange, className, type = "text" }: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
    if (e.key === "Escape") {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "bg-background border border-primary rounded-md px-2 py-1.5 text-sm outline-none w-full",
          className
        )}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
        className
      )}
    >
      <span className="truncate">{value || "-"}</span>
      <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}
