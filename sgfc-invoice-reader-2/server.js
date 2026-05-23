const express = require('express');
const multer = require('multer');
// 🛠️ Remplacement d'Anthropic par Google Gen AI
const { GoogleGenAI } = require('@google/genai'); 
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// 🛠️ Initialisation avec votre clé Render existante
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

app.use(express.static('public'));
app.use(express.json());

app.post('/api/extract', upload.fields([
  { name: 'invoices', maxCount: 50 },
  { name: 'template', maxCount: 1 }
]), async (req, res) => {
  try {
    const invoiceFiles = req.files['invoices'] || [];
    const templateFile = req.files['template']?.[0];

    if (!templateFile) return res.status(400).json({ error: 'Template Excel manquant' });
    if (invoiceFiles.length === 0) return res.status(400).json({ error: 'Aucune facture fournie' });

    const extractedRows = [];

    for (const file of invoiceFiles) {
      const base64 = file.buffer.toString('base64');
      
      // Configuration du prompt pour Gemini
      const prompt = `Tu es un assistant spécialisé dans la lecture de factures de chantier BTP français pour un gestionnaire de compte prorata.
Analyse cette facture et extrais les informations suivantes au format JSON strict.
Si une information est absente ou illisible, mets null.

Réponds UNIQUEMENT avec un tableau JSON (array), sans aucun texte avant ou après, sans balises markdown.

Format attendu:
[
  {
    "date": "JJ/MM/AA",
    "fournisseur": "Nom du fournisseur",
    "numero_facture": "Numéro de facture",
    "objet": "Description courte de la prestation (max 60 caractères)",
    "montant_ht": 1234.56,
    "ligne_budgetaire": 46,
    "mois": "MM/AAAA"
  }
]

Lignes budgétaires disponibles :
1=Voirie/domaine public, 2=Clôtures/palissades, 3=Voies de circulation, 4=Aire de lavage, 5=Installation électrique, 6=Aérothermes, 7=Signalétique, 8=Préchauffage aérothermes, 9=Installation électrique préchauffage, 10=Fermetures provisoires, 11=Reportage photo, 12=Base vie installation, 13=Bungalows cantonnement, 14=Bungalows bureaux, 15=Assurance bungalows, 16=Reprographie/cafetière, 17=Entretien bungalows, 18=Eau, 19=Electricité, 20=Téléphone/Internet, 21=Bungalows logistique/contrôle accès, 22=Equipe logistique/contrôle accès, 23=Badges, 24=Agent cynophile, 25=Télésurveillance, 26=Fontaines eau, 27=Extincteurs, 28=EPI, 29=Infirmière, 30=Sanitaires autonomes, 31=Sanitaires définitifs, 32=Signalétique sécurité, 33=Protections collectives, 34=Lifts, 35=Ascenseurs/monte-charge, 36=Liftiers, 37=Echafaudages, 38=Nettoyage base vie, 39=Déchets ménagers, 40=Nettoyage circulations, 41=Nettoyage sans tiers, 42=Balayeuse HP, 43=Containers/mini-bennes, 44=Manitou/cariste, 45=Agent nettoyage/manutention, 46=Bennes de chantier, 47=Nettoyage OPR/réception, 48=Aléas, 49=Honoraires`;

      try {
        // 🛠️ Appel natif à Gemini Flash (ultra rapide et efficace pour les factures)
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            prompt,
            {
              inlineData: {
                mimeType: file.mimetype,
                data: base64
              }
            }
          ],
        });

        const text = response.text || '[]';
        const clean = text.replace(/```json|```/g, '').trim();
        const rows = JSON.parse(clean);
        rows.forEach(r => { r._filename = file.originalname; });
        extractedRows.push(...rows);
      } catch (err) {
        extractedRows.push({
          _filename: file.originalname,
          _error: err.message,
          date: null, fournisseur: null, numero_facture: null,
          objet: null, montant_ht: null, ligne_budgetaire: null, mois: null
        });
      }
    }

    // --- Le reste de la logique d'écriture Excel reste 100% identique ---
    const wb = XLSX.read(templateFile.buffer, { type: 'buffer', cellFormulas: true });
    const ws = wb.Sheets['Facture'];

    if (!ws) return res.status(400).json({ error: "Onglet 'Facture' introuvable dans le template" });

    const range = ws['!ref'] ? XLSX.utils.decode_range(ws['!ref']) : { s: { r: 0, c: 0 }, e: { r: 30, c: 16 } };
    let startRow = 5;
    while (startRow <= range.e.r + 1) {
      const cell = ws[XLSX.utils.encode_cell({ r: startRow, c: 0 })];
      if (!cell || cell.v === undefined || cell.v === null || cell.v === '') break;
      startRow++;
    }

    const validRows = extractedRows.filter(r => !r._error);
    validRows.forEach((row, i) => {
      const r = startRow + i;
      const set = (c, val, t) => {
        if (val !== null && val !== undefined && val !== '') {
          ws[XLSX.utils.encode_cell({ r, c })] = { v: val, t: t || 's' };
        }
      };
      if (row.date) set(0, row.date, 's');
      if (row.fournisseur) set(1, row.fournisseur, 's');
      if (row.numero_facture) set(2, String(row.numero_facture), 's');
      if (row.objet) set(3, row.objet, 's');
      if (row.montant_ht) set(4, parseFloat(row.montant_ht), 'n');
      if (row.ligne_budgetaire) set(5, String(row.ligne_budgetaire), 's');
      if (row.mois) set(6, row.mois, 's');
      ws[XLSX.utils.encode_cell({ r, c: 7 })] = {
        f: `IF(NOT(ISBLANK(A${r + 1})),EOMONTH(A${r + 1}+45,0),"")`, t: 'n'
      };
    });

    const lastRow = Math.max(range.e.r, startRow + validRows.length - 1);
    ws['!ref'] = XLSX.utils.encode_range({ s: range.s, e: { r: lastRow, c: Math.max(range.e.c, 16) } });

    const outBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const outName = templateFile.originalname.replace('.xlsx', '_mis_a_jour.xlsx');

    res.json({
      extracted: extractedRows,
      insertedCount: validRows.length,
      startRow: startRow + 1,
      filename: outName,
      fileBase64: outBuffer.toString('base64')
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SGFC app running on port ${PORT}`));
