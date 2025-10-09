# Assalam Next.js Frontend

This repository contains a minimal Next.js frontend for the Pondok As-Salam payment system. It is intended to be exported to static HTML and hosted on GitHub Pages, while the backend remains on Google Apps Script (GAS) as a REST API.

## What is included

- `app/` — Next.js app (login, form, recap)
- `lib/api.js` — API helper (set `BASE_URL` to your deployed GAS Web App URL)
- `components/` — small UI components (Navbar, Loading)
- `public/` — public assets
- `deploy.ps1` — PowerShell script to build/export and publish to `gh-pages` branch

## Prerequisites

- Node.js (>=16 recommended)
- npm
- git
- A deployed Google Apps Script Web App URL (see instructions below)

## Configure

1. Deploy your Google Apps Script (`Kode.gs`) as a Web App:
   - Execute as: `Me (your account)`
   - Who has access: `Anyone, even anonymous`
   - Copy the Web App URL (e.g. `https://script.google.com/macros/s/AKfycb.../exec`)

2. Update `lib/api.js`:

```js
const BASE_URL = "https://script.google.com/macros/s/AKfycb.../exec"; // replace with your URL
```

3. (Optional) Verify endpoints with PowerShell (replace URL if different):

```powershell
# Get students
Invoke-RestMethod -Uri 'https://script.google.com/macros/s/AKfycb.../exec?path=students' -Method GET

# Get categories
Invoke-RestMethod -Uri 'https://script.google.com/macros/s/AKfycb.../exec?path=categories' -Method GET

# Test login (POST)
Invoke-RestMethod -Uri 'https://script.google.com/macros/s/AKfycb.../exec?path=login' -Method POST -ContentType 'application/json' -Body (@{ email='admin@example.com'; password='password' } | ConvertTo-Json)
```

## Build & Export (static)

From the `nextjs-frontend` folder run:

```powershell
npm install
npm run build
npm run export   # generates `out/` folder
```

## Publish to GitHub Pages (simple PowerShell script)

Use the included `deploy.ps1` to build/export and push the `out/` directory to branch `gh-pages`.

```powershell
# Run from repository root or inside nextjs-frontend
.\deploy.ps1
```

Important: the script will create a temporary orphan branch `gh-pages` and force-push `out/` as the content. It also switches you back to your original branch afterwards.

## Manual publish steps (if you prefer)

```powershell
npm run build
npm run export

# Create an orphan branch and publish the `out/` folder
$CurrentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
git checkout --orphan gh-pages
git --work-tree=out add --all
git --work-tree=out commit -m "Deploy site"
git push origin HEAD:gh-pages --force
git checkout $CurrentBranch
git branch -D gh-pages
```

## Notes & Next steps

- The frontend talks to GAS via `lib/api.js`. Make sure `BASE_URL` points to the deployed Web App URL.
- Apps Script must be deployed with access public if you host the frontend on GitHub Pages (anonymous requests).
- For security/production, consider adding an API token or moving frontend behind an auth layer.
- If you want CI-based deployment, I can add a GitHub Actions workflow to run the export and push to `gh-pages` automatically.

If you want, I can now:

- Add a GitHub Actions workflow to auto-deploy on push, or
- Implement jsPDF/html2pdf integration so the PDF buttons work out-of-the-box.

Tell me which one you'd like next.