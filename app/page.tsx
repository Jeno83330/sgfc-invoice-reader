"use client";

import * as React from "react";
import { Header } from "@/components/header";
import { StepIndicator } from "@/components/step-indicator";
import { FileDropZone } from "@/components/file-drop-zone";
import { InvoiceList, type InvoiceFile } from "@/components/invoice-list";
import { StatsGrid } from "@/components/stats-grid";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { extractInvoices } from "./actions";
import type { ExtractedRow, ExtractionResult } from "@/lib/constants";
import {
  FileSpreadsheet,
  Receipt,
  Sparkles,
  Download,
  Plus,
  RefreshCw,
  Brain,
} from "lucide-react";

export default function Dashboard() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [xlsxFile, setXlsxFile] = React.useState<File | null>(null);
  const [invoices, setInvoices] = React.useState<InvoiceFile[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<ExtractionResult | null>(null);
  const [extractedRows, setExtractedRows] = React.useState<ExtractedRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleXlsxSelected = (files: File[]) => {
    const file = files[0];
    if (file && file.name.endsWith(".xlsx")) {
      setXlsxFile(file);
      setCurrentStep(2);
      setError(null);
    } else {
      setError("Veuillez selectionner un fichier .xlsx valide");
    }
  };

  const handleInvoicesSelected = (files: File[]) => {
    const newInvoices = files
      .filter((f) => !invoices.find((inv) => inv.name === f.name))
      .map((f) => ({ file: f, name: f.name, status: "pending" as const }));
    setInvoices((prev) => [...prev, ...newInvoices]);
    setError(null);
  };

  const handleRemoveInvoice = (index: number) => {
    setInvoices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowUpdate = (
    index: number,
    field: keyof ExtractedRow,
    value: string | number | null
  ) => {
    setExtractedRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAnalyze = async () => {
    if (!xlsxFile || invoices.length === 0) return;

    setIsProcessing(true);
    setProgress(15);
    setCurrentStep(3);
    setError(null);

    // Update invoice statuses to processing
    setInvoices((prev) =>
      prev.map((inv) => ({ ...inv, status: "processing" as const }))
    );

    try {
      setProgress(50);

      const formData = new FormData();
      formData.append("template", xlsxFile);
      invoices.forEach((inv) => formData.append("invoices", inv.file));

      const data = await extractInvoices(formData);

      setProgress(100);
      setResult(data);
      setExtractedRows(data.extracted);

      // Update invoice statuses based on results
      setInvoices((prev) =>
        prev.map((inv) => {
          const extracted = data.extracted.find((r) => r._filename === inv.name);
          return {
            ...inv,
            status: extracted?._error ? ("error" as const) : ("success" as const),
          };
        })
      );

      setTimeout(() => {
        setCurrentStep(4);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setInvoices((prev) =>
        prev.map((inv) => ({ ...inv, status: "error" as const }))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const byteCharacters = atob(result.fileBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setXlsxFile(null);
    setInvoices([]);
    setIsProcessing(false);
    setProgress(0);
    setResult(null);
    setExtractedRows([]);
    setError(null);
  };

  const validCount = extractedRows.filter((r) => !r._error).length;
  const errorCount = extractedRows.filter((r) => r._error).length;
  const totalHT = extractedRows
    .filter((r) => !r._error)
    .reduce((sum, r) => sum + (r.montant_ht || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Subtle grid pattern background */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Step Indicator */}
        <div className="flex justify-center mb-8">
          <StepIndicator currentStep={currentStep} />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Step 1: Template Upload */}
        <Card className="mb-6">
          <CardHeader
            icon={<FileSpreadsheet className="h-5 w-5 text-primary" />}
            title="Fichier Excel template"
            description="Votre fichier SGFC_Tableau_de_gestion_Type.xlsx"
          />
          <FileDropZone
            accept=".xlsx"
            onFilesSelected={handleXlsxSelected}
            title="Glissez votre template ici"
            description="Fichier .xlsx uniquement"
            icon={<FileSpreadsheet className="h-7 w-7 text-muted-foreground" />}
            loadedFile={xlsxFile?.name}
          />
        </Card>

        {/* Step 2: Invoice Upload */}
        {currentStep >= 2 && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader
              icon={<Receipt className="h-5 w-5 text-primary" />}
              title="Factures a importer"
              description="PDF ou images JPG/PNG - plusieurs fichiers possibles"
            />
            <FileDropZone
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onFilesSelected={handleInvoicesSelected}
              title="Glissez vos factures ici"
              description="PDF, JPG, PNG - selection multiple autorisee"
              icon={<Receipt className="h-7 w-7 text-muted-foreground" />}
            />
            <InvoiceList invoices={invoices} onRemove={handleRemoveInvoice} />

            {invoices.length > 0 && !isProcessing && currentStep < 3 && (
              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  onClick={handleAnalyze}
                  icon={<Sparkles className="h-4 w-4" />}
                >
                  Analyser avec l&apos;IA
                </Button>
                <Button
                  variant="default"
                  onClick={() =>
                    document.querySelector<HTMLInputElement>('input[accept=".pdf,.jpg,.jpeg,.png"]')?.click()
                  }
                  icon={<Plus className="h-4 w-4" />}
                >
                  Ajouter d&apos;autres
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Step 3: Processing */}
        {isProcessing && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader
              icon={<Brain className="h-5 w-5 text-primary animate-pulse" />}
              title="Extraction en cours"
              description="L&apos;IA analyse chaque facture..."
            />
            <Alert variant="info" className="mb-4">
              Gemini analyse vos factures (peut prendre 30-60s)...
            </Alert>
            <Progress value={progress} showLabel />
          </Card>
        )}

        {/* Step 4: Results */}
        {result && currentStep >= 4 && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <CardHeader
                icon={<Sparkles className="h-5 w-5 text-primary" />}
                title="Resultats de l&apos;extraction"
                description={`${validCount} ligne(s) prete(s) a inserer a partir de la ligne ${result.startRow}`}
              />

              <StatsGrid
                extractedCount={validCount}
                totalHT={totalHT}
                errorCount={errorCount}
              />

              {validCount > 0 && (
                <Alert variant="success" className="mb-6">
                  <strong>{validCount} ligne(s)</strong> prete(s) a inserer dans l&apos;onglet
                  Facture. Verifiez et corrigez si besoin avant de telecharger.
                </Alert>
              )}

              {errorCount > 0 && (
                <Alert variant="warning" className="mb-6">
                  {errorCount} facture(s) n&apos;ont pas pu etre lues correctement.
                </Alert>
              )}

              <DataTable rows={extractedRows} onRowUpdate={handleRowUpdate} />

              <div className="flex gap-3 mt-6">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleDownload}
                  icon={<Download className="h-4 w-4" />}
                >
                  Telecharger l&apos;Excel
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handleReset}
                  icon={<RefreshCw className="h-4 w-4" />}
                >
                  Nouveau dossier
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            SGFC Invoice Reader v2.0 - Propulse par Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
