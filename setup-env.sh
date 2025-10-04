#!/bin/bash

# Environment Setup Script for PrivacyNumber Production
# This script helps you set up the required environment variables

echo "🔧 PrivacyNumber Environment Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to generate a secure random string
generate_secret() {
    openssl rand -base64 32 2>/dev/null || echo "your-secret-key-$(date +%s)"
}

echo "This script will help you set up the environment variables for production deployment."
echo ""

# Check if openssl is available for generating secrets
if command -v openssl &> /dev/null; then
    print_info "OpenSSL found - will generate secure secrets"
else
    print_warning "OpenSSL not found - using timestamp-based secrets"
fi

echo ""
echo "Please provide the following information:"
echo ""

# Database password
read -p "PostgreSQL Password (leave empty for auto-generated): " POSTGRES_PASSWORD
if [ -z "$POSTGRES_PASSWORD" ]; then
    POSTGRES_PASSWORD=$(generate_secret)
    print_info "Generated PostgreSQL password: $POSTGRES_PASSWORD"
fi

# NextAuth secret
read -p "NextAuth Secret (leave empty for auto-generated): " NEXTAUTH_SECRET
if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(generate_secret)
    print_info "Generated NextAuth secret"
fi

# SMS-man API key
read -p "SMS-man API Key: " SMS_MAN_API_KEY
if [ -z "$SMS_MAN_API_KEY" ]; then
    print_error "SMS-man API Key is required!"
    exit 1
fi

# Domain
read -p "Domain (default: www.privatenumber.org): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="www.privatenumber.org"
fi

# Generate environment file
ENV_FILE=".env.production"
cat > "$ENV_FILE" << EOF
# Production Environment Variables for PrivacyNumber
# Generated on $(date)

# Database Configuration
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/privacynumber

# Authentication
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://${DOMAIN}

# SMS-man API Configuration
SMS_MAN_API_KEY=${SMS_MAN_API_KEY}
SMS_MAN_BASE_URL=https://sms-man.com/api

# PostgreSQL Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=privacynumber

# Node Environment
NODE_ENV=production
EOF

print_info "Environment file created: $ENV_FILE"

echo ""
echo "📋 Environment Variables Summary:"
echo "================================="
echo "Domain: https://$DOMAIN"
echo "Database: PostgreSQL (privacynumber)"
echo "SMS-man API: Configured"
echo "NextAuth: Configured with secure secret"
echo ""

print_warning "Important Security Notes:"
print_warning "1. Never commit the .env.production file to version control"
print_warning "2. Keep your SMS-man API key secure"
print_warning "3. Store the PostgreSQL password securely"
echo ""

print_info "Next steps:"
print_info "1. Review the generated .env.production file"
print_info "2. Run: source .env.production"
print_info "3. Deploy with: ./deploy-production.sh"
echo ""

read -p "Do you want to source the environment variables now? (y/n): " SOURCE_NOW
if [ "$SOURCE_NOW" = "y" ] || [ "$SOURCE_NOW" = "Y" ]; then
    source "$ENV_FILE"
    print_info "Environment variables sourced successfully!"
    print_info "You can now run: ./deploy-production.sh"
else
    print_info "To source the environment variables later, run:"
    print_info "source $ENV_FILE"
fi

echo ""
print_info "🎉 Environment setup completed!"
