#!/bin/bash
# Deployment script for frontend to Firebase Hosting

set -e

echo "🎨 Building frontend..."

# Install dependencies
npm install

# Build production bundle
npm run build

echo "🔥 Deploying to Firebase Hosting..."

# Deploy to Firebase
firebase deploy --only hosting --project kalasetu-e55c4

echo "✅ Frontend deployed successfully!"
echo "📍 URLs:"
echo "   - https://kalasetu-e55c4.web.app"
echo "   - https://kalasetu-e55c4.firebaseapp.com"

