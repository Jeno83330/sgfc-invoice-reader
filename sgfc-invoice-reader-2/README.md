# SGFC — Lecture automatique de factures

Application web pour lire des factures PDF/image et remplir automatiquement le tableau de gestion compte prorata SGFC.
Utilise **Google Gemini 1.5 Flash** — entièrement gratuit (1500 requêtes/jour).

## Déploiement sur Render

### 1. Créer un dépôt GitHub
1. Va sur [github.com](https://github.com) → "New repository"
2. Nom : `sgfc-invoice-reader`, visibilité **Private**
3. Clique "uploading an existing file" → glisse tous les fichiers du zip

### 2. Déployer sur Render
1. [render.com](https://render.com) → "New +" → "Web Service"
2. Connecte GitHub → sélectionne le dépôt
3. Render détecte tout via `render.yaml`

### 3. Clé API Gemini (gratuite)
1. Va sur [aistudio.google.com](https://aistudio.google.com)
2. Clique "Get API Key" → "Create API key"
3. Dans Render → "Environment Variables" → ajoute :
   - Clé : `GEMINI_API_KEY`
   - Valeur : ta clé Google (commence par `AIza...`)

### 4. Deploy → ton URL est prête !
