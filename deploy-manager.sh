#!/bin/bash

# PrivacyNumber Deployment Manager
# This script provides a comprehensive interface for managing deployments and rollbacks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_header() {
    echo -e "${PURPLE}🎯 $1${NC}"
}

# Function to show usage
show_usage() {
    echo "PrivacyNumber Deployment Manager"
    echo "================================"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy              Deploy to production"
    echo "  rollback            Rollback to previous deployment"
    echo "  status              Show deployment status"
    echo "  list                List available deployments"
    echo "  backup              Create manual backup"
    echo "  restore             Restore from backup"
    echo "  health              Check application health"
    echo "  logs                Show application logs"
    echo ""
    echo "Options:"
    echo "  -t, --tag TAG       Specify deployment tag for rollback"
    echo "  -e, --env ENV       Environment (production/staging)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy                    # Deploy to production"
    echo "  $0 rollback --tag deploy-20241201-143022  # Rollback to specific tag"
    echo "  $0 status                   # Show current status"
    echo "  $0 list                     # List deployments"
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running"
        exit 1
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose > /dev/null 2>&1; then
        print_error "docker-compose is not installed"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Function to deploy
deploy() {
    print_header "Starting deployment..."
    
    check_prerequisites
    
    # Check if deploy-production.sh exists and is executable
    if [ ! -f "deploy-production.sh" ]; then
        print_error "deploy-production.sh not found"
        exit 1
    fi
    
    chmod +x deploy-production.sh
    ./deploy-production.sh
    
    print_status "Deployment completed!"
}

# Function to rollback
rollback() {
    local tag=$1
    
    print_header "Starting rollback..."
    
    check_prerequisites
    
    # Check if rollback.sh exists and is executable
    if [ ! -f "rollback.sh" ]; then
        print_error "rollback.sh not found"
        exit 1
    fi
    
    chmod +x rollback.sh
    
    if [ -n "$tag" ]; then
        ./rollback.sh --tag "$tag"
    else
        ./rollback.sh
    fi
    
    print_status "Rollback completed!"
}

# Function to show deployment status
show_status() {
    print_header "Deployment Status"
    echo ""
    
    # Git status
    print_info "Git Status:"
    git status --short
    echo ""
    
    # Current branch and commit
    print_info "Current Branch: $(git branch --show-current)"
    print_info "Current Commit: $(git rev-parse --short HEAD)"
    echo ""
    
    # Docker containers status
    print_info "Docker Containers:"
    if docker-compose -f docker-compose.prod.yml ps 2>/dev/null; then
        echo ""
    else
        print_warning "Docker containers not running"
        echo ""
    fi
    
    # Application health
    print_info "Application Health:"
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        print_status "Application is healthy"
    else
        print_warning "Application health check failed"
    fi
    echo ""
    
    # Recent deployments
    print_info "Recent Deployments:"
    git tag -l "deploy-*" | sort -V -r | head -5
}

# Function to list deployments
list_deployments() {
    print_header "Available Deployments"
    echo ""
    
    git tag -l "deploy-*" | sort -V -r | head -10
    echo ""
    
    print_info "Total deployments: $(git tag -l "deploy-*" | wc -l)"
}

# Function to create manual backup
create_backup() {
    print_header "Creating Manual Backup"
    echo ""
    
    BACKUP_DIR=".manual-backup-$(date +%Y%m%d-%H%M%S)"
    print_info "Creating backup: $BACKUP_DIR"
    
    mkdir -p "$BACKUP_DIR"
    cp -r . "$BACKUP_DIR/" 2>/dev/null || true
    
    print_status "Backup created: $BACKUP_DIR"
}

# Function to restore from backup
restore_backup() {
    print_header "Available Backups"
    echo ""
    
    # List available backups
    ls -la .manual-backup-* .deployment-backup-* .rollback-backup-* 2>/dev/null | head -10 || print_warning "No backups found"
    echo ""
    
    read -p "Enter backup directory name: " backup_dir
    
    if [ ! -d "$backup_dir" ]; then
        print_error "Backup directory '$backup_dir' not found"
        exit 1
    fi
    
    print_warning "This will restore from backup: $backup_dir"
    read -p "Are you sure? (y/N): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        print_info "Restoring from backup..."
        cp -r "$backup_dir"/* . 2>/dev/null || true
        print_status "Restore completed!"
    else
        print_info "Restore cancelled"
    fi
}

# Function to check application health
check_health() {
    print_header "Application Health Check"
    echo ""
    
    # Check if containers are running
    print_info "Checking Docker containers..."
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_status "Containers are running"
    else
        print_error "Some containers are not running"
        docker-compose -f docker-compose.prod.yml ps
        return 1
    fi
    echo ""
    
    # Check application endpoint
    print_info "Checking application endpoint..."
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        print_status "Application is responding"
    else
        print_warning "Application health check failed"
        return 1
    fi
    echo ""
    
    # Check database connection
    print_info "Checking database connection..."
    if docker-compose -f docker-compose.prod.yml exec -T app npm run db:push > /dev/null 2>&1; then
        print_status "Database connection is healthy"
    else
        print_warning "Database connection check failed"
    fi
}

# Function to show logs
show_logs() {
    print_header "Application Logs"
    echo ""
    
    print_info "Showing recent logs (last 50 lines)..."
    echo ""
    
    docker-compose -f docker-compose.prod.yml logs --tail=50 -f
}

# Main function
main() {
    local command=$1
    shift
    
    case $command in
        deploy)
            deploy
            ;;
        rollback)
            local tag=""
            while [[ $# -gt 0 ]]; do
                case $1 in
                    -t|--tag)
                        tag="$2"
                        shift 2
                        ;;
                    *)
                        shift
                        ;;
                esac
            done
            rollback "$tag"
            ;;
        status)
            show_status
            ;;
        list)
            list_deployments
            ;;
        backup)
            create_backup
            ;;
        restore)
            restore_backup
            ;;
        health)
            check_health
            ;;
        logs)
            show_logs
            ;;
        -h|--help|help)
            show_usage
            ;;
        "")
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
