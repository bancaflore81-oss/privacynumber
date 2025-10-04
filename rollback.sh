#!/bin/bash

# PrivacyNumber Rollback Script
# This script allows you to rollback to a previous deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --tag TAG        Rollback to specific deployment tag"
    echo "  -l, --list          List available deployment tags"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --list                    # List available deployments"
    echo "  $0 --tag deploy-20241201-143022  # Rollback to specific tag"
    echo "  $0                          # Interactive rollback"
}

# Function to list available deployment tags
list_deployments() {
    print_info "Available deployment tags:"
    echo ""
    
    # Get deployment tags sorted by date (newest first)
    git tag -l "deploy-*" | sort -V -r | head -10
    
    echo ""
    print_info "To rollback to a specific deployment, use:"
    print_info "./rollback.sh --tag <tag-name>"
}

# Function to create backup before rollback
create_backup() {
    print_status "Creating backup of current state..."
    
    BACKUP_DIR=".rollback-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup current files
    cp -r . "$BACKUP_DIR/" 2>/dev/null || true
    
    print_status "Backup created: $BACKUP_DIR"
}

# Function to rollback to specific tag
rollback_to_tag() {
    local tag=$1
    
    print_info "Rolling back to tag: $tag"
    
    # Verify tag exists
    if ! git tag -l | grep -q "^$tag$"; then
        print_error "Tag '$tag' does not exist"
        print_info "Available tags:"
        git tag -l "deploy-*" | sort -V -r | head -5
        exit 1
    fi
    
    # Create backup
    create_backup
    
    # Checkout the specific tag
    print_status "Checking out tag: $tag"
    git checkout "$tag"
    
    # Set environment variables (same as production)
    export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:password@db:5432/sms-man-clone}"
    export SMS_MAN_API_KEY="${SMS_MAN_API_KEY}"
    export NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
    export NEXTAUTH_URL="${NEXTAUTH_URL:-https://www.privatenumber.org}"
    export POSTGRES_USER="${POSTGRES_USER:-postgres}"
    export POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"
    export POSTGRES_DB="${POSTGRES_DB:-sms-man-clone}"
    export NODE_ENV="production"
    
    # Deploy the rolled back version
    print_status "Deploying rolled back version..."
    chmod +x deploy-production.sh
    ./deploy-production.sh
    
    # Verify deployment
    print_status "Verifying rollback deployment..."
    chmod +x verify-deployment.sh
    ./verify-deployment.sh
    
    print_status "Rollback completed successfully!"
    print_warning "Note: You are now in detached HEAD state on tag: $tag"
    print_info "To continue development, run: git checkout main"
}

# Function for interactive rollback
interactive_rollback() {
    print_info "Interactive rollback mode"
    echo ""
    
    # List recent deployments
    print_info "Recent deployments:"
    git tag -l "deploy-*" | sort -V -r | head -5 | nl -w2 -s'. '
    echo ""
    
    # Ask user to select
    read -p "Enter the number of the deployment to rollback to (or 'q' to quit): " choice
    
    if [ "$choice" = "q" ] || [ "$choice" = "Q" ]; then
        print_info "Rollback cancelled"
        exit 0
    fi
    
    # Get the selected tag
    selected_tag=$(git tag -l "deploy-*" | sort -V -r | sed -n "${choice}p")
    
    if [ -z "$selected_tag" ]; then
        print_error "Invalid selection"
        exit 1
    fi
    
    print_info "Selected deployment: $selected_tag"
    read -p "Are you sure you want to rollback to this deployment? (y/N): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        rollback_to_tag "$selected_tag"
    else
        print_info "Rollback cancelled"
        exit 0
    fi
}

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
}

# Main function
main() {
    echo "🔄 PrivacyNumber Rollback Script"
    echo "================================"
    echo ""
    
    # Check if we're in a git repository
    check_git_repo
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--tag)
                TAG="$2"
                shift 2
                ;;
            -l|--list)
                list_deployments
                exit 0
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Execute based on arguments
    if [ -n "$TAG" ]; then
        rollback_to_tag "$TAG"
    else
        interactive_rollback
    fi
}

# Run main function
main "$@"
