#!/bin/bash

# Wait for Repository Script
# This script waits for the GitHub repository to be created and then pushes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
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

print_header() {
    echo -e "${BLUE}🔍 $1${NC}"
}

# Function to test repository access
test_repository() {
    print_info "Testing repository access..."
    
    if git ls-remote origin > /dev/null 2>&1; then
        print_status "Repository is accessible!"
        return 0
    else
        print_warning "Repository not yet accessible"
        return 1
    fi
}

# Function to push to repository
push_to_repository() {
    print_header "Pushing to GitHub Repository"
    echo ""
    
    print_info "Pushing latest changes..."
    
    if git push origin main; then
        print_status "Push successful!"
        print_status "GitHub Actions deployment started!"
        echo ""
        print_info "Deployment Details:"
        print_info "- Repository: $(git remote get-url origin)"
        print_info "- Branch: $(git branch --show-current)"
        print_info "- Commit: $(git rev-parse --short HEAD)"
        echo ""
        print_info "Next Steps:"
        print_info "1. Go to GitHub > Actions to monitor deployment"
        print_info "2. Check the 'Deploy to Production' workflow"
        print_info "3. Monitor deployment progress"
        print_info "4. Test rollback functionality if needed"
        return 0
    else
        print_error "Push failed"
        return 1
    fi
}

# Function to wait and retry
wait_and_retry() {
    local max_attempts=10
    local attempt=1
    
    print_header "Waiting for Repository to be Created"
    echo ""
    
    print_info "Checking if repository 'bancaflore81-oss/privacynumber' exists..."
    print_info "Please create the repository on GitHub if you haven't already"
    echo ""
    
    while [ $attempt -le $max_attempts ]; do
        print_info "Attempt $attempt/$max_attempts..."
        
        if test_repository; then
            echo ""
            push_to_repository
            return 0
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            print_info "Waiting 10 seconds before retry..."
            sleep 10
        fi
        
        attempt=$((attempt + 1))
    done
    
    print_error "Repository not accessible after $max_attempts attempts"
    print_info "Please make sure you've created the repository on GitHub:"
    print_info "1. Go to GitHub.com"
    print_info "2. Click '+' → 'New repository'"
    print_info "3. Name: 'privacynumber'"
    print_info "4. Owner: 'bancaflore81-oss'"
    print_info "5. Create repository"
    print_info "6. Run this script again"
    
    return 1
}

# Main function
main() {
    echo "⏳ Wait for Repository & Deploy"
    echo "=============================="
    echo ""
    
    print_info "Repository URL: $(git remote get-url origin)"
    print_info "Waiting for repository to be created on GitHub..."
    echo ""
    
    wait_and_retry
}

# Run main function
main "$@"
