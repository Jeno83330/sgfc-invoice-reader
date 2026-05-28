"use server";

import { GoogleGenAI } from "@google/genai";
import * as XLSX from "xlsx";
import type { ExtractedRow, ExtractionResult } from "@/lib/constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const EXTRACTION_PROMPT = `Tu es un assistant specialise dans la lecture de factures de chantier BTP francais pour un gestionnaire de compte prorata.
Analyse cette facture et extrais les informations suivantes au format JSON strict.
Si une information est absente ou illisible, mets null.

Reponds UNIQUEMENT avec un tableau JSON (array), sans aucun texte avant ou apres, sans balises markdown.

Format attendu:
[
  {
    "date": "JJ/MM/AA",
    "fournisseur": "Nom du fournisseur",
    "numero_facture": "Numero de facture",
    "objet": "Description courte de la prestation (max 60 caracteres)",
    "montant_ht": 1234.56,
    "ligne_budgetaire": 46,
    "mois": "MM/AAAA"
  }
]

Lignes budgetaires disponibles (choisir le numero le plus pertinent selon la prestation) :
1=Voirie/domaine public, 2=Clotures/palissades, 3=Voies de circulation, 4=Aire de lavage, 5=Installation electrique, 6=Aerothermes, 7=Signaletique, 8=Prechauffage aerothermes, 9=Installation electrique prechauffage, 10=Fermetures provisoires, 11=Reportage photo, 12=Base vie installation, 13=Bungalows cantonnement, 14=Bungalows bureaux, 15=Assurance bungalows, 16=Reprographie/cafetiere, 17=Entretien bungalows, 18=Eau, 19=Electricite, 20=Telephone/Internet, 21=Bungalows logistique/controle acces, 22=Equipe logistique/controle acces, 23=Badges, 24=Agent cynophile, 25=Telesurveillance, 26=Fontaines eau, 27=Extincteurs, 28=EPI, 29=Infirmiere, 30=Sanitaires autonomes, 31=Sanitaires definitifs, 32=Signaletique securite, 33=Protections collectives, 34=Lifts, 35=Ascenseurs/monte-charge, 36=Liftiers, 37=Echafaudages, 38=Nettoyage base vie, 39=Dechets menagers, 40=Nettoyage circulations, 41=Nettoyage sans tiers, 42=Balayeuse HP, 43=Containers/mini-bennes, 44=Manitou/cariste, 45=Agent nettoyage/manutention, 46=Bennes de chantier, 47=Nettoyage OPR/reception, 48=Aleas, 49=Honoraires

Notes:
- date: date d'emission de la facture au format JJ/MM/AA
- montant_ht: montant hors taxes en nombre decimal (sans symbole €)
- mois: mois de la prestation au format MM/AAAA (utilise le mois de la date de facture si non precise)
- ligne_budgetaire: numero entier parmi la liste ci-dessus`;

export async function extractInvoices(formData: FormData): Promise<ExtractionResult> {
  const templateFile = formData.get("template") as File;
  const invoiceFiles = formData.getAll("invoices") as File[];

  if (!templateFile) {
    throw new Error("Template Excel manquant");
  }

  if (invoiceFiles.length === 0) {
    throw new Error("Aucune facture fournie");
  }

  const extractedRows: ExtractedRow[] = [];

  // Process each invoice
  for (const file of invoiceFiles) {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          EXTRACTION_PROMPT,
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
        ],
      });

      const text = response.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const rows = JSON.parse(clean) as ExtractedRow[];
      rows.forEach((r) => {
        r._filename = file.name;
      });
      extractedRows.push(...rows);
    } catch (err) {
      extractedRows.push({
        _filename: file.name,
        _error: err instanceof Error ? err.message : "Erreur inconnue",
        date: null,
        fournisseur: null,
        numero_facture: null,
        objet: null,
        montant_ht: null,
        ligne_budgetaire: null,
        mois: null,
      });
    }
  }

  // Process Excel template
  const templateBuffer = await templateFile.arrayBuffer();
  const wb = XLSX.read(templateBuffer, { type: "array", cellFormulas: true });
  const ws = wb.Sheets["Facture"];

  if (!ws) {
    throw new Error("Onglet 'Facture' introuvable dans le template");
  }

  const range = ws["!ref"]
    ? XLSX.utils.decode_range(ws["!ref"])
    : { s: { r: 0, c: 0 }, e: { r: 30, c: 16 } };

  let startRow = 5;
  while (startRow <= range.e.r + 1) {
    const cell = ws[XLSX.utils.encode_cell({ r: startRow, c: 0 })];
    if (!cell || cell.v === undefined || cell.v === null || cell.v === "") break;
    startRow++;
  }

  const validRows = extractedRows.filter((r) => !r._error);
  validRows.forEach((row, i) => {
    const r = startRow + i;
    const set = (c: number, val: string | number | null | undefined, t: string) => {
      if (val !== null && val !== undefined && val !== "") {
        ws[XLSX.utils.encode_cell({ r, c })] = { v: val, t: t || "s" };
      }
    };
    if (row.date) set(0, row.date, "s");
    if (row.fournisseur) set(1, row.fournisseur, "s");
    if (row.numero_facture) set(2, String(row.numero_facture), "s");
    if (row.objet) set(3, row.objet, "s");
    if (row.montant_ht) set(4, parseFloat(String(row.montant_ht)), "n");
    if (row.ligne_budgetaire) set(5, String(row.ligne_budgetaire), "s");
    if (row.mois) set(6, row.mois, "s");
    ws[XLSX.utils.encode_cell({ r, c: 7 })] = {
      f: `IF(NOT(ISBLANK(A${r + 1})),EOMONTH(A${r + 1}+45,0),"")`,
      t: "n",
    };
  });

  const lastRow = Math.max(range.e.r, startRow + validRows.length - 1);
  ws["!ref"] = XLSX.utils.encode_range({
    s: range.s,
    e: { r: lastRow, c: Math.max(range.e.c, 16) },
  });

  const outBuffer = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  const outName = templateFile.name.replace(".xlsx", "_mis_a_jour.xlsx");

  return {
    extracted: extractedRows,
    insertedCount: validRows.length,
    startRow: startRow + 1,
    filename: outName,
    fileBase64: outBuffer,
  };
}
