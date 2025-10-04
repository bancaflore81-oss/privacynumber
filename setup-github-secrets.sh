#!/bin/bash

# GitHub Secrets Setup Script
# This script helps you configure the required secrets for GitHub Actions

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
    echo -e "${BLUE}🔧 $1${NC}"
}

# Function to show usage
show_usage() {
    echo "GitHub Secrets Setup Script"
    echo "=========================="
    echo ""
    echo "This script helps you configure GitHub secrets for automated deployment."
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -i, --interactive   Interactive mode (default)"
    echo "  -g, --generate      Generate sample values"
    echo ""
    echo "The script will guide you through setting up:"
    echo "  - Production server credentials"
    echo "  - Database configuration"
    echo "  - API keys"
    echo "  - Authentication secrets"
}

# Function to generate sample values
generate_samples() {
    print_header "Generating Sample Values"
    echo ""
    
    print_info "Here are sample values for your GitHub secrets:"
    echo ""
    
    echo "PRODUCTION_HOST=your-server-ip-or-domain.com"
    echo "PRODUCTION_USER=ubuntu"
    echo "PRODUCTION_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----..."
    echo "DATABASE_URL=postgresql://postgres:your_password@db:5432/privacynumber"
    echo "SMS_MAN_API_KEY=your_sms_man_api_key_here"
    echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
    echo "NEXTAUTH_URL=https://www.privatenumber.org"
    echo "POSTGRES_USER=postgres"
    echo "POSTGRES_PASSWORD=$(openssl rand -base64 16)"
    echo "POSTGRES_DB=privacynumber"
    echo "SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
    echo ""
    
    print_warning "IMPORTANT: Replace all placeholder values with your actual values!"
}

# Function to check GitHub CLI
check_gh_cli() {
    if command -v gh > /dev/null 2>&1; then
        print_status "GitHub CLI is installed"
        return 0
    else
        print_warning "GitHub CLI is not installed"
        print_info "You can install it with:"
        print_info "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
        print_info "  echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main\" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null"
        print_info "  sudo apt update && sudo apt install gh"
        return 1
    fi
}

# Function to setup secrets interactively
setup_secrets_interactive() {
    print_header "Interactive GitHub Secrets Setup"
    echo ""
    
    # Check if GitHub CLI is available
    if check_gh_cli; then
        print_info "GitHub CLI detected. You can set secrets directly."
        echo ""
        
        read -p "Do you want to set secrets via GitHub CLI? (y/N): " use_cli
        
        if [ "$use_cli" = "y" ] || [ "$use_cli" = "Y" ]; then
            setup_secrets_via_cli
            return
        fi
    fi
    
    # Manual setup instructions
    print_info "Manual setup instructions:"
    echo ""
    print_info "1. Go to your GitHub repository"
    print_info "2. Navigate to Settings > Secrets and variables > Actions"
    print_info "3. Click 'New repository secret'"
    print_info "4. Add each secret with the following names and values:"
    echo ""
    
    # Required secrets
    echo "Required Secrets:"
    echo "================="
    echo ""
    
    echo "PRODUCTION_HOST"
    read -p "Enter your production server host/IP: " prod_host
    echo "Value: $prod_host"
    echo ""
    
    echo "PRODUCTION_USER"
    read -p "Enter your SSH username (default: ubuntu): " prod_user
    prod_user=${prod_user:-ubuntu}
    echo "Value: $prod_user"
    echo ""
    
    echo "PRODUCTION_SSH_KEY"
    print_info "This should be your private SSH key content"
    read -p "Enter path to your SSH private key file: " ssh_key_path
    if [ -f "$ssh_key_path" ]; then
        echo "Value: $(cat "$ssh_key_path")"
    else
        print_warning "SSH key file not found. Please provide the key content manually."
    fi
    echo ""
    
    echo "DATABASE_URL"
    read -p "Enter your database URL (default: postgresql://postgres:password@db:5432/privacynumber): " db_url
    db_url=${db_url:-postgresql://postgres:password@db:5432/privacynumber}
    echo "Value: $db_url"
    echo ""
    
    echo "SMS_MAN_API_KEY"
    read -p "Enter your SMS-man API key: " sms_api_key
    echo "Value: $sms_api_key"
    echo ""
    
    echo "NEXTAUTH_SECRET"
    nextauth_secret=$(openssl rand -base64 32)
    echo "Generated value: $nextauth_secret"
    echo ""
    
    echo "NEXTAUTH_URL"
    read -p "Enter your application URL (default: https://www.privatenumber.org): " nextauth_url
    nextauth_url=${nextauth_url:-https://www.privatenumber.org}
    echo "Value: $nextauth_url"
    echo ""
    
    echo "POSTGRES_USER"
    read -p "Enter PostgreSQL username (default: postgres): " postgres_user
    postgres_user=${postgres_user:-postgres}
    echo "Value: $postgres_user"
    echo ""
    
    echo "POSTGRES_PASSWORD"
    postgres_password=$(openssl rand -base64 16)
    echo "Generated value: $postgres_password"
    echo ""
    
    echo "POSTGRES_DB"
    read -p "Enter PostgreSQL database name (default: privacynumber): " postgres_db
    postgres_db=${postgres_db:-privacynumber}
    echo "Value: $postgres_db"
    echo ""
    
    echo "Optional Secrets:"
    echo "================="
    echo ""
    
    echo "SLACK_WEBHOOK"
    read -p "Enter your Slack webhook URL (optional): " slack_webhook
    if [ -n "$slack_webhook" ]; then
        echo "Value: $slack_webhook"
    else
        echo "Value: (not set - notifications disabled)"
    fi
    echo ""
    
    print_status "Secrets configuration completed!"
    print_info "Please add these secrets to your GitHub repository now."
}

# Function to setup secrets via GitHub CLI
setup_secrets_via_cli() {
    print_header "Setting up secrets via GitHub CLI"
    echo ""
    
    # Check if user is authenticated
    if ! gh auth status > /dev/null 2>&1; then
        print_info "Please authenticate with GitHub CLI first:"
        print_info "gh auth login"
        return 1
    fi
    
    print_info "Setting up secrets via GitHub CLI..."
    echo ""
    
    # Required secrets
    echo "PRODUCTION_HOST"
    read -p "Enter your production server host/IP: " prod_host
    gh secret set PRODUCTION_HOST --body "$prod_host"
    
    echo "PRODUCTION_USER"
    read -p "Enter your SSH username (default: ubuntu): " prod_user
    prod_user=${prod_user:-ubuntu}
    gh secret set PRODUCTION_USER --body "$prod_user"
    
    echo "PRODUCTION_SSH_KEY"
    read -p "Enter path to your SSH private key file: " ssh_key_path
    if [ -f "$ssh_key_path" ]; then
        gh secret set PRODUCTION_SSH_KEY < "$ssh_key_path"
    else
        print_error "SSH key file not found"
        return 1
    fi
    
    echo "DATABASE_URL"
    read -p "Enter your database URL: " db_url
    gh secret set DATABASE_URL --body "$db_url"
    
    echo "SMS_MAN_API_KEY"
    read -p "Enter your SMS-man API key: " sms_api_key
    gh secret set SMS_MAN_API_KEY --body "$sms_api_key"
    
    echo "NEXTAUTH_SECRET"
    nextauth_secret=$(openssl rand -base64 32)
    gh secret set NEXTAUTH_SECRET --body "$nextauth_secret"
    
    echo "NEXTAUTH_URL"
    read -p "Enter your application URL: " nextauth_url
    gh secret set NEXTAUTH_URL --body "$nextauth_url"
    
    echo "POSTGRES_USER"
    read -p "Enter PostgreSQL username: " postgres_user
    gh secret set POSTGRES_USER --body "$postgres_user"
    
    echo "POSTGRES_PASSWORD"
    postgres_password=$(openssl rand -base64 16)
    gh secret set POSTGRES_PASSWORD --body "$postgres_password"
    
    echo "POSTGRES_DB"
    read -p "Enter PostgreSQL database name: " postgres_db
    gh secret set POSTGRES_DB --body "$postgres_db"
    
    echo "SLACK_WEBHOOK"
    read -p "Enter your Slack webhook URL (optional, press Enter to skip): " slack_webhook
    if [ -n "$slack_webhook" ]; then
        gh secret set SLACK_WEBHOOK --body "$slack_webhook"
    fi
    
    print_status "All secrets have been set via GitHub CLI!"
}

# Function to verify secrets
verify_secrets() {
    print_header "Verifying GitHub Secrets"
    echo ""
    
    if check_gh_cli && gh auth status > /dev/null 2>&1; then
        print_info "Checking secrets via GitHub CLI..."
        
        required_secrets=(
            "PRODUCTION_HOST"
            "PRODUCTION_USER"
            "PRODUCTION_SSH_KEY"
            "DATABASE_URL"
            "SMS_MAN_API_KEY"
            "NEXTAUTH_SECRET"
            "NEXTAUTH_URL"
            "POSTGRES_USER"
            "POSTGRES_PASSWORD"
            "POSTGRES_DB"
        )
        
        for secret in "${required_secrets[@]}"; do
            if gh secret list | grep -q "$secret"; then
                print_status "$secret is set"
            else
                print_warning "$secret is missing"
            fi
        done
        
        if gh secret list | grep -q "SLACK_WEBHOOK"; then
            print_status "SLACK_WEBHOOK is set (optional)"
        else
            print_info "SLACK_WEBHOOK is not set (optional)"
        fi
    else
        print_info "Please verify your secrets manually in GitHub:"
        print_info "Repository > Settings > Secrets and variables > Actions"
    fi
}

# Main function
main() {
    local mode="interactive"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -i|--interactive)
                mode="interactive"
                shift
                ;;
            -g|--generate)
                mode="generate"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    case $mode in
        interactive)
            setup_secrets_interactive
            verify_secrets
            ;;
        generate)
            generate_samples
            ;;
    esac
    
    echo ""
    print_status "Setup completed!"
    print_info "Next steps:"
    print_info "1. Verify all secrets are set correctly"
    print_info "2. Test the deployment workflow"
    print_info "3. Configure your production server"
    print_info "4. Run your first deployment!"
}

# Run main function
main "$@"
