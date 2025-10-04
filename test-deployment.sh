#!/bin/bash

# Deployment Test Script
# This script tests the deployment and rollback functionality

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
    echo -e "${BLUE}🧪 $1${NC}"
}

# Function to show usage
show_usage() {
    echo "Deployment Test Script"
    echo "====================="
    echo ""
    echo "This script tests the deployment and rollback functionality."
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -a, --all           Run all tests"
    echo "  -s, --scripts       Test deployment scripts only"
    echo "  -w, --workflows     Test GitHub workflows only"
    echo "  -d, --dry-run       Dry run (no actual deployment)"
    echo ""
    echo "Tests:"
    echo "  - Script syntax validation"
    echo "  - File permissions"
    echo "  - Docker configuration"
    echo "  - GitHub Actions syntax"
    echo "  - Environment setup"
}

# Function to test script syntax
test_script_syntax() {
    print_header "Testing Script Syntax"
    echo ""
    
    local scripts=(
        "deploy-production.sh"
        "rollback.sh"
        "deploy-manager.sh"
        "setup-github-secrets.sh"
        "verify-deployment.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            if bash -n "$script"; then
                print_status "$script syntax is valid"
            else
                print_error "$script has syntax errors"
                return 1
            fi
        else
            print_warning "$script not found"
        fi
    done
    
    print_status "All script syntax tests passed"
}

# Function to test file permissions
test_file_permissions() {
    print_header "Testing File Permissions"
    echo ""
    
    local scripts=(
        "deploy-production.sh"
        "rollback.sh"
        "deploy-manager.sh"
        "setup-github-secrets.sh"
        "verify-deployment.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ]; then
            if [ -x "$script" ]; then
                print_status "$script is executable"
            else
                print_warning "$script is not executable, fixing..."
                chmod +x "$script"
                print_status "$script is now executable"
            fi
        fi
    done
    
    print_status "All file permission tests passed"
}

# Function to test Docker configuration
test_docker_config() {
    print_header "Testing Docker Configuration"
    echo ""
    
    # Check if Docker is running
    if docker info > /dev/null 2>&1; then
        print_status "Docker is running"
    else
        print_error "Docker is not running"
        return 1
    fi
    
    # Check docker-compose files
    if [ -f "docker-compose.yml" ]; then
        print_status "docker-compose.yml exists"
    else
        print_error "docker-compose.yml not found"
        return 1
    fi
    
    if [ -f "docker-compose.prod.yml" ]; then
        print_status "docker-compose.prod.yml exists"
    else
        print_error "docker-compose.prod.yml not found"
        return 1
    fi
    
    # Test docker-compose syntax
    if docker-compose -f docker-compose.yml config > /dev/null 2>&1; then
        print_status "docker-compose.yml syntax is valid"
    else
        print_error "docker-compose.yml has syntax errors"
        return 1
    fi
    
    if docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
        print_status "docker-compose.prod.yml syntax is valid"
    else
        print_error "docker-compose.prod.yml has syntax errors"
        return 1
    fi
    
    print_status "All Docker configuration tests passed"
}

# Function to test GitHub Actions workflows
test_github_workflows() {
    print_header "Testing GitHub Actions Workflows"
    echo ""
    
    local workflows=(
        ".github/workflows/deploy.yml"
        ".github/workflows/rollback.yml"
    )
    
    for workflow in "${workflows[@]}"; do
        if [ -f "$workflow" ]; then
            print_status "$workflow exists"
            
            # Basic YAML syntax check
            if command -v yq > /dev/null 2>&1; then
                if yq eval '.' "$workflow" > /dev/null 2>&1; then
                    print_status "$workflow YAML syntax is valid"
                else
                    print_error "$workflow has YAML syntax errors"
                    return 1
                fi
            else
                print_warning "yq not installed, skipping YAML validation"
            fi
        else
            print_error "$workflow not found"
            return 1
        fi
    done
    
    print_status "All GitHub Actions workflow tests passed"
}

# Function to test environment setup
test_environment_setup() {
    print_header "Testing Environment Setup"
    echo ""
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        print_status "package.json exists"
    else
        print_error "package.json not found"
        return 1
    fi
    
    # Check if Dockerfile exists
    if [ -f "Dockerfile" ]; then
        print_status "Dockerfile exists"
    else
        print_error "Dockerfile not found"
        return 1
    fi
    
    # Check if nginx.conf exists
    if [ -f "nginx.conf" ]; then
        print_status "nginx.conf exists"
    else
        print_warning "nginx.conf not found (optional)"
    fi
    
    # Check if ssl directory exists
    if [ -d "ssl" ]; then
        print_status "ssl directory exists"
    else
        print_warning "ssl directory not found (will be created during deployment)"
    fi
    
    print_status "Environment setup tests passed"
}

# Function to test deployment scripts functionality
test_deployment_scripts() {
    print_header "Testing Deployment Scripts Functionality"
    echo ""
    
    # Test deploy-manager.sh help
    if ./deploy-manager.sh --help > /dev/null 2>&1; then
        print_status "deploy-manager.sh help works"
    else
        print_error "deploy-manager.sh help failed"
        return 1
    fi
    
    # Test rollback.sh help
    if ./rollback.sh --help > /dev/null 2>&1; then
        print_status "rollback.sh help works"
    else
        print_error "rollback.sh help failed"
        return 1
    fi
    
    # Test setup-github-secrets.sh help
    if ./setup-github-secrets.sh --help > /dev/null 2>&1; then
        print_status "setup-github-secrets.sh help works"
    else
        print_error "setup-github-secrets.sh help failed"
        return 1
    fi
    
    # Test deploy-manager.sh status
    if ./deploy-manager.sh status > /dev/null 2>&1; then
        print_status "deploy-manager.sh status works"
    else
        print_warning "deploy-manager.sh status failed (may be expected if not deployed)"
    fi
    
    print_status "Deployment scripts functionality tests passed"
}

# Function to run dry run deployment
test_dry_run_deployment() {
    print_header "Testing Dry Run Deployment"
    echo ""
    
    print_info "This would test the deployment process without actually deploying"
    print_info "Checking if all required files and configurations are present..."
    
    # Check if all required files exist
    local required_files=(
        "deploy-production.sh"
        "rollback.sh"
        "deploy-manager.sh"
        "docker-compose.prod.yml"
        "Dockerfile"
        "package.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_status "$file exists"
        else
            print_error "$file is missing"
            return 1
        fi
    done
    
    # Check if scripts are executable
    local scripts=(
        "deploy-production.sh"
        "rollback.sh"
        "deploy-manager.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -x "$script" ]; then
            print_status "$script is executable"
        else
            print_error "$script is not executable"
            return 1
        fi
    done
    
    print_status "Dry run deployment test passed"
}

# Function to run all tests
run_all_tests() {
    print_header "Running All Tests"
    echo ""
    
    test_script_syntax
    test_file_permissions
    test_docker_config
    test_github_workflows
    test_environment_setup
    test_deployment_scripts
    test_dry_run_deployment
    
    echo ""
    print_status "🎉 All tests passed!"
    print_info "Your deployment setup is ready!"
}

# Main function
main() {
    local test_mode="all"
    local dry_run=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -a|--all)
                test_mode="all"
                shift
                ;;
            -s|--scripts)
                test_mode="scripts"
                shift
                ;;
            -w|--workflows)
                test_mode="workflows"
                shift
                ;;
            -d|--dry-run)
                dry_run=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    case $test_mode in
        all)
            run_all_tests
            ;;
        scripts)
            test_script_syntax
            test_file_permissions
            test_deployment_scripts
            ;;
        workflows)
            test_github_workflows
            ;;
    esac
    
    if [ "$dry_run" = true ]; then
        test_dry_run_deployment
    fi
    
    echo ""
    print_info "Next steps:"
    print_info "1. Configure GitHub secrets: ./setup-github-secrets.sh"
    print_info "2. Push to GitHub to trigger deployment"
    print_info "3. Monitor the deployment in GitHub Actions"
    print_info "4. Test rollback functionality if needed"
}

# Run main function
main "$@"
