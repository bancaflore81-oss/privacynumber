#!/bin/bash

# Quick Deploy Script
# This script performs a complete deployment setup and push

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Function to show usage
show_usage() {
    echo "Quick Deploy Script"
    echo "==================="
    echo ""
    echo "This script performs a complete deployment setup:"
    echo "1. Tests GitHub SSH connection"
    echo "2. Configures GitHub secrets (optional)"
    echo "3. Pushes to GitHub to trigger deployment"
    echo "4. Monitors deployment status"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -s, --setup-secrets Setup GitHub secrets interactively"
    echo "  -f, --force         Force push even if tests fail"
    echo ""
    echo "Examples:"
    echo "  $0                  # Quick deploy with connection test"
    echo "  $0 --setup-secrets  # Deploy with secrets setup"
    echo "  $0 --force         # Force deploy (skip tests)"
}

# Function to test GitHub connection
test_github_connection() {
    print_header "Testing GitHub SSH Connection"
    echo ""
    
    print_info "Testing SSH connection to GitHub..."
    
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        print_status "SSH connection to GitHub successful!"
        return 0
    else
        print_error "SSH connection to GitHub failed"
        print_warning "Please add the SSH key to your GitHub account first"
        echo ""
        print_info "SSH Key to add:"
        echo "=================="
        cat ~/.ssh/github_deploy.pub
        echo ""
        return 1
    fi
}

# Function to setup GitHub secrets
setup_github_secrets() {
    print_header "Setting up GitHub Secrets"
    echo ""
    
    if [ -f "setup-github-secrets.sh" ]; then
        print_info "Running GitHub secrets setup..."
        ./setup-github-secrets.sh
    else
        print_warning "setup-github-secrets.sh not found"
        print_info "You can configure secrets manually in GitHub:"
        print_info "Repository > Settings > Secrets and variables > Actions"
    fi
}

# Function to push to GitHub
push_to_github() {
    print_header "Pushing to GitHub"
    echo ""
    
    print_info "Pushing latest changes to GitHub..."
    
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

# Function to show deployment status
show_deployment_status() {
    print_header "Current Deployment Status"
    echo ""
    
    print_info "Repository: $(git remote get-url origin)"
    print_info "Branch: $(git branch --show-current)"
    print_info "Latest commit: $(git rev-parse --short HEAD)"
    print_info "Commit message: $(git log -1 --pretty=format:'%s')"
    echo ""
    
    print_info "Recent commits:"
    git log --oneline -3
    echo ""
    
    print_info "Files ready for deployment:"
    git status --short
}

# Function to monitor deployment
monitor_deployment() {
    print_header "Deployment Monitoring"
    echo ""
    
    print_info "To monitor your deployment:"
    print_info "1. Go to: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
    print_info "2. Look for 'Deploy to Production' workflow"
    print_info "3. Click on the latest run to see details"
    print_info "4. Monitor the deployment progress"
    echo ""
    
    print_info "If deployment fails:"
    print_info "- Check the logs in GitHub Actions"
    print_info "- Verify GitHub secrets are configured"
    print_info "- Check server SSH access"
    print_info "- Use rollback if needed: ./deploy-manager.sh rollback"
}

# Main function
main() {
    local setup_secrets=false
    local force=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -s|--setup-secrets)
                setup_secrets=true
                shift
                ;;
            -f|--force)
                force=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo "🚀 PrivacyNumber Quick Deploy"
    echo "============================="
    echo ""
    
    # Show current status
    show_deployment_status
    echo ""
    
    # Test GitHub connection
    if ! test_github_connection; then
        if [ "$force" = false ]; then
            print_error "Cannot proceed without GitHub SSH connection"
            print_info "Please add the SSH key to GitHub first"
            exit 1
        else
            print_warning "Proceeding with force mode (SSH connection not verified)"
        fi
    fi
    
    echo ""
    
    # Setup secrets if requested
    if [ "$setup_secrets" = true ]; then
        setup_github_secrets
        echo ""
    fi
    
    # Push to GitHub
    if push_to_github; then
        echo ""
        monitor_deployment
        echo ""
        print_status "🎉 Deployment initiated successfully!"
        print_info "Your PrivacyNumber application is being deployed to production!"
    else
        print_error "Deployment failed"
        exit 1
    fi
}

# Run main function
main "$@"
