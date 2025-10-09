#!/bin/bash
# Build, export and publish Next.js static export to gh-pages branch
# Run this script from the nextjs-frontend folder (or adjust paths accordingly)

# Exit on error
set -e

if [ ! -f "package.json" ]; then
  echo "package.json not found. Run this script from the nextjs-frontend folder."
  exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

echo "Exporting static site..."
npm run export

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Publishing out/ to gh-pages branch..."
# Create orphan branch and push out/ as content
git checkout --orphan gh-pages
git --work-tree=out add --all
git --work-tree=out commit -m "Deploy site"
git push origin HEAD:gh-pages --force

# Switch back
git checkout "$CURRENT_BRANCH"
git branch -D gh-pages

echo "Published to gh-pages branch."