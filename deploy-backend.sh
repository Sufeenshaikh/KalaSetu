#!/bin/bash
# Deployment script for backend to Google Cloud Run

set -e

PROJECT_ID="kalasetu-e55c4"
REGION="us-central1"
SERVICE_NAME="kalasetu-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying KalaSetu Backend to Cloud Run..."

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "📦 Enabling required APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Build and push Docker image
echo "🐳 Building Docker image..."
cd backend
gcloud builds submit --tag $IMAGE_NAME

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars PORT=8080,FIREBASE_PROJECT_ID=${PROJECT_ID},GCLOUD_STORAGE_BUCKET=${PROJECT_ID}.firebasestorage.app

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo "✅ Backend deployed successfully!"
echo "📍 Service URL: $SERVICE_URL"
echo ""
echo "⚠️  Don't forget to set sensitive environment variables:"
echo "   - FIREBASE_CLIENT_EMAIL"
echo "   - FIREBASE_PRIVATE_KEY"
echo "   - GEMINI_API_KEY"
echo "   - STRIPE_SECRET_KEY"
echo ""
echo "Run: gcloud run services update $SERVICE_NAME --update-env-vars KEY=value --region $REGION"

