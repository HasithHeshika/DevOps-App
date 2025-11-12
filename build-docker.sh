#!/bin/bash

# PropertyHub Docker Build Script
# This script builds Docker images from the GitHub repository

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO="https://github.com/HasithHeshika/DevOps-App.git"
BRANCH="main"
DOCKER_USERNAME="${DOCKER_USERNAME:-hasithheshika01}"  # Change this to your Docker Hub username

echo -e "${GREEN}PropertyHub Docker Build Script${NC}"
echo "=================================="
echo ""

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warn "Docker Compose is not installed. Some features may not work."
fi

# Display menu
echo "Choose build method:"
echo "1. Clone and build locally"
echo "2. Build from GitHub directly (advanced)"
echo "3. Build and push to Docker Hub"
echo "4. Build using docker-compose"
echo "5. Exit"
echo ""
read -p "Enter your choice [1-5]: " choice

case $choice in
    1)
        print_info "Cloning repository..."
        if [ -d "DevOps-App" ]; then
            print_warn "Directory already exists. Pulling latest changes..."
            cd DevOps-App
            git pull
        else
            git clone $GITHUB_REPO
            cd DevOps-App
        fi
        
        print_info "Building Docker images..."
        docker-compose build
        
        print_info "Images built successfully!"
        print_info "Run 'docker-compose up -d' to start the application"
        ;;
    
    2)
        print_info "Building backend image from GitHub..."
        docker build \
            -t propertyhub-backend:latest \
            -f backend/Dockerfile \
            ${GITHUB_REPO}#${BRANCH}:backend
        
        print_info "Building frontend image from GitHub..."
        docker build \
            -t propertyhub-frontend:latest \
            -f frontend/Dockerfile \
            ${GITHUB_REPO}#${BRANCH}:frontend
        
        print_info "Images built successfully!"
        print_info "Backend: propertyhub-backend:latest"
        print_info "Frontend: propertyhub-frontend:latest"
        ;;
    
    3)
        read -p "Enter your Docker Hub username [$DOCKER_USERNAME]: " input_username
        DOCKER_USERNAME=${input_username:-$DOCKER_USERNAME}
        
        print_info "Logging into Docker Hub..."
        docker login
        
        print_info "Building and tagging backend image..."
        docker build -t ${DOCKER_USERNAME}/propertyhub-backend:latest ./backend
        docker build -t ${DOCKER_USERNAME}/propertyhub-backend:$(date +%Y%m%d) ./backend
        
        print_info "Building and tagging frontend image..."
        docker build -t ${DOCKER_USERNAME}/propertyhub-frontend:latest ./frontend
        docker build -t ${DOCKER_USERNAME}/propertyhub-frontend:$(date +%Y%m%d) ./frontend
        
        read -p "Push images to Docker Hub? (y/n): " push_choice
        if [ "$push_choice" = "y" ]; then
            print_info "Pushing backend image..."
            docker push ${DOCKER_USERNAME}/propertyhub-backend:latest
            docker push ${DOCKER_USERNAME}/propertyhub-backend:$(date +%Y%m%d)
            
            print_info "Pushing frontend image..."
            docker push ${DOCKER_USERNAME}/propertyhub-frontend:latest
            docker push ${DOCKER_USERNAME}/propertyhub-frontend:$(date +%Y%m%d)
            
            print_info "Images pushed successfully!"
        fi
        ;;
    
    4)
        print_info "Building with docker-compose..."
        docker-compose build --no-cache
        
        read -p "Start containers? (y/n): " start_choice
        if [ "$start_choice" = "y" ]; then
            print_info "Starting containers..."
            docker-compose up -d
            
            print_info "Waiting for containers to be ready..."
            sleep 10
            
            print_info "Container status:"
            docker-compose ps
            
            echo ""
            print_info "Application is running!"
            print_info "Frontend: http://localhost:3000"
            print_info "Backend: http://localhost:5000"
            print_info "MongoDB: localhost:27017"
        fi
        ;;
    
    5)
        print_info "Exiting..."
        exit 0
        ;;
    
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
print_info "Build complete!"
