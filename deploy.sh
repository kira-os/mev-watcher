#!/bin/bash

# Deploy MEV Watcher to Cloudflare Pages
# Usage: ./deploy.sh

set -e

echo "🚀 Deploying MEV Watcher to Cloudflare Pages"
echo "=============================================="

# Check for required env vars
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
  echo "❌ CLOUDFLARE_API_TOKEN not set"
  exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
  echo "❌ CLOUDFLARE_ACCOUNT_ID not set"
  exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist/ not found"
  exit 1
fi

# Deploy using Cloudflare CLI
echo "☁️  Deploying to Cloudflare..."
npx wrangler pages deploy dist \
  --project-name="mev-watcher" \
  --commit-dirty=true

echo "✅ Deployment complete!"
echo ""
echo "Your MEV Watcher is now live at:"
echo "https://mev-watcher.pages.dev"
