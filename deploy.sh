#!/bin/bash

# PrivacyNumber Deployment Script
# This script handles the complete deployment process

set -e

echo "🚀 Starting PrivacyNumber deployment..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$SMS_MAN_API_KEY" ]; then
    echo "❌ SMS_MAN_API_KEY environment variable is required"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET environment variable is required"
    exit 1
fi

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npm run db:generate

# Run database migrations
echo "🔄 Running database migrations..."
npm run db:push

# Run tests
echo "🧪 Running tests..."
npm test

# Build the application
echo "🏗️ Building application..."
npm run build

echo "✅ Build completed successfully!"

# Start the application
echo "🚀 Starting application..."
npm start
