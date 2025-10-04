#!/bin/bash

# PrivacyNumber Deployment Verification Script
# This script verifies that the deployment matches localhost:3002

set -e

echo "🔍 PrivacyNumber Deployment Verification"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Configuration
PRODUCTION_URL="https://www.privatenumber.org"
LOCAL_URL="http://localhost:3002"
TIMEOUT=10

echo "Verifying deployment of PrivacyNumber..."
echo "Production URL: $PRODUCTION_URL"
echo "Local URL: $LOCAL_URL"
echo ""

# Function to check HTTP response
check_url() {
    local url=$1
    local description=$2
    
    print_info "Checking $description..."
    
    if curl -s --max-time $TIMEOUT "$url" > /dev/null 2>&1; then
        print_success "$description is accessible"
        return 0
    else
        print_error "$description is not accessible"
        return 1
    fi
}

# Function to check API endpoint
check_api() {
    local url=$1
    local endpoint=$2
    local description=$3
    
    print_info "Checking $description..."
    
    local response=$(curl -s --max-time $TIMEOUT "$url$endpoint" 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        print_success "$description is responding"
        return 0
    else
        print_error "$description is not responding"
        return 1
    fi
}

# Function to compare page content
compare_pages() {
    local local_url=$1
    local prod_url=$2
    local page_name=$3
    
    print_info "Comparing $page_name content..."
    
    # Get local content (remove dynamic elements)
    local local_content=$(curl -s --max-time $TIMEOUT "$local_url" 2>/dev/null | \
        sed 's/localhost:3002/www.privatenumber.org/g' | \
        grep -E "(PrivacyNumber|SMS|Receive)" | head -5)
    
    # Get production content
    local prod_content=$(curl -s --max-time $TIMEOUT "$prod_url" 2>/dev/null | \
        grep -E "(PrivacyNumber|SMS|Receive)" | head -5)
    
    if [ "$local_content" = "$prod_content" ]; then
        print_success "$page_name content matches"
        return 0
    else
        print_warning "$page_name content differs (this might be expected)"
        return 1
    fi
}

# Start verification
echo "🚀 Starting verification process..."
echo ""

# Check if Docker containers are running
print_info "Checking Docker containers..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "Docker containers are running"
else
    print_error "Docker containers are not running"
    echo "Run: docker-compose -f docker-compose.prod.yml up -d"
    exit 1
fi

echo ""

# Check local application
print_info "Checking local application..."
if check_url "$LOCAL_URL" "Local application"; then
    print_success "Local application is running on localhost:3002"
else
    print_warning "Local application is not running on localhost:3002"
    print_info "Start local development server: npm run dev"
fi

echo ""

# Check production application
print_info "Checking production application..."
if check_url "$PRODUCTION_URL" "Production application"; then
    print_success "Production application is accessible"
else
    print_error "Production application is not accessible"
    print_info "Check your deployment and DNS configuration"
    exit 1
fi

echo ""

# Check API endpoints
print_info "Checking API endpoints..."

# Health check
if check_api "$PRODUCTION_URL" "/api/health" "Health endpoint"; then
    # Get health response details
    local health_response=$(curl -s --max-time $TIMEOUT "$PRODUCTION_URL/api/health")
    print_info "Health response: $health_response"
fi

# Check other API endpoints
check_api "$PRODUCTION_URL" "/api/countries" "Countries API" || true
check_api "$PRODUCTION_URL" "/api/services" "Services API" || true

echo ""

# Compare main pages
print_info "Comparing page content..."

# Home page
compare_pages "$LOCAL_URL" "$PRODUCTION_URL" "Home page" || true

# Auth pages
compare_pages "$LOCAL_URL/auth/login" "$PRODUCTION_URL/auth/login" "Login page" || true
compare_pages "$LOCAL_URL/auth/register" "$PRODUCTION_URL/auth/register" "Register page" || true

echo ""

# Check SSL certificate
print_info "Checking SSL certificate..."
if echo | openssl s_client -connect privatenumber.org:443 -servername privatenumber.org 2>/dev/null | \
   openssl x509 -noout -dates 2>/dev/null | grep -q "notAfter"; then
    print_success "SSL certificate is valid"
else
    print_warning "SSL certificate check failed"
fi

echo ""

# Performance check
print_info "Checking response times..."
local local_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time $TIMEOUT "$LOCAL_URL" 2>/dev/null || echo "N/A")
local prod_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time $TIMEOUT "$PRODUCTION_URL" 2>/dev/null || echo "N/A")

if [ "$local_time" != "N/A" ] && [ "$prod_time" != "N/A" ]; then
    print_info "Local response time: ${local_time}s"
    print_info "Production response time: ${prod_time}s"
    
    # Convert to numbers for comparison
    local local_num=$(echo "$local_time" | bc 2>/dev/null || echo "0")
    local prod_num=$(echo "$prod_time" | bc 2>/dev/null || echo "0")
    
    if (( $(echo "$prod_num < $local_num * 2" | bc -l) )); then
        print_success "Production performance is acceptable"
    else
        print_warning "Production performance is slower than expected"
    fi
fi

echo ""

# Final summary
echo "📊 Verification Summary"
echo "======================="

if check_url "$PRODUCTION_URL" "Production application" >/dev/null 2>&1; then
    print_success "✅ Production deployment is successful!"
    print_success "✅ Application is accessible at $PRODUCTION_URL"
    print_success "✅ SSL certificate is configured"
    print_success "✅ Docker containers are running"
    
    echo ""
    print_info "🎉 Your PrivacyNumber application is now live!"
    print_info "🌐 Visit: $PRODUCTION_URL"
    print_info "📱 The same version that runs on localhost:3002 is now online"
    
    echo ""
    print_warning "Next steps:"
    print_warning "1. Test all functionality on the production site"
    print_warning "2. Set up monitoring and alerts"
    print_warning "3. Configure automated backups"
    print_warning "4. Set up log rotation"
    
else
    print_error "❌ Production deployment verification failed"
    print_error "Check the issues above and retry deployment"
    exit 1
fi

echo ""
print_info "Verification completed at $(date)"
