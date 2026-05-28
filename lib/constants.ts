export const LIGNES_BUDGETAIRES: Record<number, string> = {
  1: "Voirie/domaine public",
  2: "Clotures/palissades",
  3: "Voies de circulation",
  4: "Aire de lavage",
  5: "Installation electrique",
  6: "Aerothermes",
  7: "Signaletique exterieure",
  8: "Prechauffage aerothermes",
  9: "Elect. prechauffage",
  10: "Fermetures provisoires",
  11: "Reportage photo",
  12: "Base vie installation",
  13: "Bungalows cantonnement",
  14: "Bungalows bureaux",
  15: "Assurance bungalows",
  16: "Reprographie/cafetiere",
  17: "Entretien bungalows",
  18: "Eau",
  19: "Electricite",
  20: "Telephone/Internet",
  21: "Bungalows logistique",
  22: "Equipe logistique",
  23: "Badges",
  24: "Agent cynophile",
  25: "Telesurveillance",
  26: "Fontaines eau",
  27: "Extincteurs",
  28: "EPI",
  29: "Infirmiere",
  30: "Sanitaires autonomes",
  31: "Sanitaires definitifs",
  32: "Signaletique securite",
  33: "Protections collectives",
  34: "Lifts",
  35: "Ascenseurs/monte-charge",
  36: "Liftiers",
  37: "Echafaudages",
  38: "Nettoyage base vie",
  39: "Dechets menagers",
  40: "Nettoyage circulations",
  41: "Nettoyage sans tiers",
  42: "Balayeuse HP",
  43: "Containers/mini-bennes",
  44: "Manitou/cariste",
  45: "Agent nettoyage",
  46: "Bennes de chantier",
  47: "Nettoyage OPR/reception",
  48: "Aleas",
  49: "Honoraires",
};

export interface ExtractedRow {
  _filename?: string;
  _error?: string;
  date: string | null;
  fournisseur: string | null;
  numero_facture: string | null;
  objet: string | null;
  montant_ht: number | null;
  ligne_budgetaire: number | null;
  mois: string | null;
}

export interface ExtractionResult {
  extracted: ExtractedRow[];
  insertedCount: number;
  startRow: number;
  filename: string;
  fileBase64: string;
}
