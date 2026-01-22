#!/bin/bash

# PropertyHub AWS Deployment Script
# This script deploys or updates the PropertyHub application on AWS EC2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TERRAFORM_DIR="../terraform"
SSH_KEY="~/.ssh/id_rsa"

# Functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Get Terraform outputs
get_server_ip() {
    cd "$TERRAFORM_DIR"
    terraform output -raw app_server_public_ip 2>/dev/null || echo ""
}

# Main deployment logic
main() {
    print_header "PropertyHub AWS Deployment Script"
    
    # Check if Terraform is initialized
    if [ ! -d "$TERRAFORM_DIR/.terraform" ]; then
        print_error "Terraform not initialized. Please run 'terraform init' first."
        exit 1
    fi
    
    # Get server IP
    SERVER_IP=$(get_server_ip)
    
    if [ -z "$SERVER_IP" ]; then
        print_error "Could not get server IP. Is infrastructure deployed?"
        print_info "Run: cd terraform && terraform apply"
        exit 1
    fi
    
    print_success "Found server IP: $SERVER_IP"
    
    # Wait for server to be ready
    print_info "Waiting for server to be accessible..."
    for i in {1..30}; do
        if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i "$SSH_KEY" ubuntu@"$SERVER_IP" "echo 'Connected'" &>/dev/null; then
            print_success "Server is accessible"
            break
        fi
        echo -n "."
        sleep 2
    done
    echo ""
    
    # Check deployment status
    print_info "Checking deployment status..."
    if ssh -i "$SSH_KEY" ubuntu@"$SERVER_IP" "[ -f /home/ubuntu/deployment-complete.txt ]" 2>/dev/null; then
        print_success "Initial deployment completed"
    else
        print_warning "Initial deployment may still be in progress"
        print_info "Check logs: ssh -i $SSH_KEY ubuntu@$SERVER_IP 'tail -f /var/log/user-data.log'"
    fi
    
    # Pull latest images
    print_info "Pulling latest Docker images..."
    ssh -i "$SSH_KEY" ubuntu@"$SERVER_IP" "cd /home/ubuntu/propertyhub && docker-compose pull"
    print_success "Images updated"
    
    # Restart containers
    print_info "Restarting containers..."
    ssh -i "$SSH_KEY" ubuntu@"$SERVER_IP" "cd /home/ubuntu/propertyhub && docker-compose up -d"
    print_success "Containers restarted"
    
    # Wait for services
    print_info "Waiting for services to be healthy..."
    sleep 15
    
    # Check container status
    print_info "Container status:"
    ssh -i "$SSH_KEY" ubuntu@"$SERVER_IP" "cd /home/ubuntu/propertyhub && docker-compose ps"
    
    # Health check
    print_info "Performing health checks..."
    
    # Backend health check
    if curl -sf "http://$SERVER_IP:5000/api/health" > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    # Frontend health check
    if curl -sf "http://$SERVER_IP" > /dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend health check failed"
    fi
    
    # Cleanup old images
    print_info "Cleaning up old Docker images..."
    ssh -i "$SSH_KEY" ubuntu@"$SERVER_IP" "docker system prune -f" > /dev/null
    print_success "Cleanup completed"
    
    # Display URLs
    print_header "Deployment Completed Successfully!"
    echo ""
    echo -e "${GREEN}Application URLs:${NC}"
    echo -e "  Frontend:  ${BLUE}http://$SERVER_IP${NC}"
    echo -e "  Backend:   ${BLUE}http://$SERVER_IP:5000${NC}"
    echo -e "  Health:    ${BLUE}http://$SERVER_IP:5000/api/health${NC}"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo -e "  SSH:       ${YELLOW}ssh -i $SSH_KEY ubuntu@$SERVER_IP${NC}"
    echo -e "  Logs:      ${YELLOW}ssh -i $SSH_KEY ubuntu@$SERVER_IP 'cd /home/ubuntu/propertyhub && docker-compose logs -f'${NC}"
    echo -e "  Status:    ${YELLOW}ssh -i $SSH_KEY ubuntu@$SERVER_IP 'cd /home/ubuntu/propertyhub && docker-compose ps'${NC}"
    echo ""
}

# Run main function
main
