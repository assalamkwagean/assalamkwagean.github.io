# deploy.ps1
# Build, export and publish Next.js static export to gh-pages branch
# Run this script from the nextjs-frontend folder (or adjust paths accordingly)

param(
  [string]$Branch = 'main'
)

if (-not (Test-Path package.json)) {
  Write-Error "package.json not found. Run this script from the nextjs-frontend folder."
  exit 1
}

Write-Host "Installing dependencies..."
npm install

Write-Host "Building..."
npm run build

Write-Host "Exporting static site..."
npm run export

$CurrentBranch = git rev-parse --abbrev-ref HEAD
if ($LASTEXITCODE -ne 0) { Write-Error "git failed"; exit 1 }

Write-Host "Publishing out/ to gh-pages branch..."
# Create orphan branch and push out/ as content
git checkout --orphan gh-pages
git --work-tree=out add --all
git --work-tree=out commit -m "Deploy site"
git push origin HEAD:gh-pages --force

# Switch back
git checkout $CurrentBranch
git branch -D gh-pages

Write-Host "Published to gh-pages branch."
