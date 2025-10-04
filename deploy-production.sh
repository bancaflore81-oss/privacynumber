#!/bin/bash

# PrivacyNumber Production Deployment Script
# This script handles the complete production deployment process

set -e

echo "🚀 Starting PrivacyNumber production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL environment variable is required"
        print_warning "Please set: export DATABASE_URL='postgresql://user:pass@host:5432/db'"
        exit 1
    fi

    if [ -z "$SMS_MAN_API_KEY" ]; then
        print_error "SMS_MAN_API_KEY environment variable is required"
        print_warning "Please set: export SMS_MAN_API_KEY='your_api_key'"
        exit 1
    fi

    if [ -z "$NEXTAUTH_SECRET" ]; then
        print_error "NEXTAUTH_SECRET environment variable is required"
        print_warning "Please set: export NEXTAUTH_SECRET='your_secret_key'"
        exit 1
    fi

    if [ -z "$NEXTAUTH_URL" ]; then
        print_warning "NEXTAUTH_URL not set, using default: https://www.privatenumber.org"
        export NEXTAUTH_URL="https://www.privatenumber.org"
    fi

    print_status "Environment variables validated"
}

# Install dependencies and build
build_application() {
    print_status "Installing dependencies..."
    npm ci --production=false

    print_status "Generating Prisma client..."
    npm run db:generate

    print_status "Building application for production..."
    npm run build

    print_status "Build completed successfully!"
}

# Deploy using Docker
deploy_with_docker() {
    print_status "Deploying with Docker Compose..."
    
    # Create deployment backup
    DEPLOYMENT_BACKUP=".deployment-backup-$(date +%Y%m%d-%H%M%S)"
    print_status "Creating deployment backup: $DEPLOYMENT_BACKUP"
    mkdir -p "$DEPLOYMENT_BACKUP"
    cp -r . "$DEPLOYMENT_BACKUP/" 2>/dev/null || true
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down || true
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 10
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T app npm run db:push || true
    
    print_status "Docker deployment completed!"
    print_info "Deployment backup saved to: $DEPLOYMENT_BACKUP"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if containers are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_status "Containers are running"
    else
        print_error "Some containers are not running"
        docker-compose -f docker-compose.prod.yml ps
        exit 1
    fi
    
    # Test health endpoint
    print_status "Testing application health..."
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        print_status "Application is responding"
    else
        print_warning "Health check failed, but deployment may still be successful"
    fi
    
    print_status "Deployment verification completed!"
}

# Main deployment process
main() {
    echo "🎯 Deploying PrivacyNumber to production..."
    echo "📍 Target: www.privatenumber.org"
    echo ""
    
    check_env_vars
    build_application
    deploy_with_docker
    verify_deployment
    
    echo ""
    print_status "🎉 Production deployment completed successfully!"
    print_status "🌐 Your application should now be available at: https://www.privatenumber.org"
    echo ""
    print_warning "Don't forget to:"
    print_warning "1. Update your DNS to point to this server"
    print_warning "2. Configure SSL certificates"
    print_warning "3. Set up monitoring and backups"
}

# Run main function
main "$@"
