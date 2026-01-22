#!/bin/bash

# PropertyHub Health Check Script
# Checks if all application components are running properly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TERRAFORM_DIR="../terraform"
TIMEOUT=10

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

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Get server IP
get_server_ip() {
    cd "$TERRAFORM_DIR"
    terraform output -raw app_server_public_ip 2>/dev/null || echo ""
}

# Health check functions
check_frontend() {
    if curl -sf -m "$TIMEOUT" "http://$1" > /dev/null 2>&1; then
        print_success "Frontend is accessible"
        return 0
    else
        print_error "Frontend is not accessible"
        return 1
    fi
}

check_backend() {
    local response=$(curl -sf -m "$TIMEOUT" "http://$1:5000/api/health" 2>/dev/null)
    if [ $? -eq 0 ]; then
        print_success "Backend API is healthy"
        echo "  Response: $response"
        return 0
    else
        print_error "Backend API is not responding"
        return 1
    fi
}

check_containers() {
    local ip=$1
    print_info "Checking Docker containers..."
    
    local containers=$(ssh -i ~/.ssh/id_rsa ubuntu@"$ip" "cd /home/ubuntu/propertyhub && docker-compose ps --format json" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        ssh -i ~/.ssh/id_rsa ubuntu@"$ip" "cd /home/ubuntu/propertyhub && docker-compose ps"
        print_success "All containers are running"
        return 0
    else
        print_error "Failed to get container status"
        return 1
    fi
}

check_disk_space() {
    local ip=$1
    print_info "Checking disk space..."
    
    local disk_usage=$(ssh -i ~/.ssh/id_rsa ubuntu@"$ip" "df -h / | awk 'NR==2 {print \$5}' | sed 's/%//'" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        if [ "$disk_usage" -lt 80 ]; then
            print_success "Disk space OK (${disk_usage}% used)"
            return 0
        else
            print_error "Disk space critical (${disk_usage}% used)"
            return 1
        fi
    else
        print_error "Failed to check disk space"
        return 1
    fi
}

check_memory() {
    local ip=$1
    print_info "Checking memory usage..."
    
    ssh -i ~/.ssh/id_rsa ubuntu@"$ip" "free -h" 2>/dev/null
    print_success "Memory status retrieved"
}

# Main health check
main() {
    print_header "PropertyHub Health Check"
    
    # Get server IP
    SERVER_IP=$(get_server_ip)
    
    if [ -z "$SERVER_IP" ]; then
        print_error "Could not get server IP"
        exit 1
    fi
    
    print_info "Checking server: $SERVER_IP"
    echo ""
    
    # Initialize counters
    PASSED=0
    FAILED=0
    
    # Run checks
    if check_frontend "$SERVER_IP"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    if check_backend "$SERVER_IP"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    if check_containers "$SERVER_IP"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    if check_disk_space "$SERVER_IP"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    check_memory "$SERVER_IP"
    
    # Summary
    echo ""
    print_header "Health Check Summary"
    echo ""
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        print_success "All health checks passed!"
        exit 0
    else
        print_error "Some health checks failed!"
        exit 1
    fi
}

# Run main function
main
