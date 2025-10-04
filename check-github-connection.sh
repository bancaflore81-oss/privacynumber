#!/bin/bash

# GitHub Connection Check Script
# This script checks if the SSH key has been added to GitHub

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

# Function to test GitHub connection
test_github_connection() {
    print_header "Testing GitHub SSH Connection"
    echo ""
    
    print_info "Testing SSH connection to GitHub..."
    
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        print_status "SSH connection to GitHub successful!"
        print_status "You can now push to GitHub and trigger deployment"
        return 0
    else
        print_error "SSH connection to GitHub failed"
        print_warning "Please add the SSH key to your GitHub account"
        echo ""
        print_info "SSH Key to add:"
        echo "=================="
        cat ~/.ssh/github_deploy.pub
        echo ""
        print_info "Steps to add the key:"
        print_info "1. Go to GitHub.com"
        print_info "2. Settings > SSH and GPG keys"
        print_info "3. New SSH key"
        print_info "4. Title: 'Deployment Key - PrivacyNumber'"
        print_info "5. Copy the key above"
        print_info "6. Add SSH key"
        return 1
    fi
}

# Function to push to GitHub
push_to_github() {
    print_header "Pushing to GitHub to Trigger Deployment"
    echo ""
    
    print_info "Pushing latest changes to GitHub..."
    
    if git push origin main; then
        print_status "Push successful!"
        print_status "GitHub Actions deployment should start automatically"
        echo ""
        print_info "Next steps:"
        print_info "1. Go to GitHub > Actions to monitor deployment"
        print_info "2. Check the 'Deploy to Production' workflow"
        print_info "3. Monitor the deployment progress"
        print_info "4. Test rollback functionality if needed"
    else
        print_error "Push failed"
        print_warning "Please check your SSH configuration and try again"
        return 1
    fi
}

# Function to show deployment status
show_deployment_status() {
    print_header "Deployment Status"
    echo ""
    
    print_info "Current branch: $(git branch --show-current)"
    print_info "Latest commit: $(git rev-parse --short HEAD)"
    print_info "Repository: $(git remote get-url origin)"
    echo ""
    
    print_info "Recent commits:"
    git log --oneline -5
}

# Main function
main() {
    echo "🚀 GitHub Connection Check & Deployment"
    echo "======================================"
    echo ""
    
    # Test GitHub connection
    if test_github_connection; then
        echo ""
        show_deployment_status
        echo ""
        
        read -p "Do you want to push to GitHub and trigger deployment? (y/N): " confirm
        
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            push_to_github
        else
            print_info "Push cancelled. You can run this script again later."
        fi
    else
        echo ""
        print_warning "Please add the SSH key to GitHub first, then run this script again."
    fi
}

# Run main function
main "$@"
