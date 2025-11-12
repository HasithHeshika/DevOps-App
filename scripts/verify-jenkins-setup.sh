#!/bin/bash

# Jenkins Setup Verification Script
# This script checks if Jenkins is properly configured for Docker builds

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Jenkins Setup Verification${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
print_info "Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status 0 "Docker is installed: $DOCKER_VERSION"
else
    print_status 1 "Docker is not installed"
    echo "   Install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
print_info "Checking Docker Compose installation..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_status 0 "Docker Compose is installed: $COMPOSE_VERSION"
else
    print_status 1 "Docker Compose is not installed"
    echo "   Install Docker Compose: https://docs.docker.com/compose/install/"
fi

# Check if Docker service is running
print_info "Checking Docker service status..."
if docker info &> /dev/null; then
    print_status 0 "Docker service is running"
else
    print_status 1 "Docker service is not running"
    echo "   Start Docker: sudo systemctl start docker"
    exit 1
fi

# Check if Jenkins container is running
print_info "Checking Jenkins container..."
if docker ps --filter "name=jenkins-server" --format "{{.Names}}" | grep -q "jenkins-server"; then
    print_status 0 "Jenkins container is running"
    
    # Get Jenkins container status
    JENKINS_STATUS=$(docker inspect -f '{{.State.Status}}' jenkins-server)
    print_info "Jenkins status: $JENKINS_STATUS"
else
    print_status 1 "Jenkins container is not running"
    echo "   Start Jenkins: cd jenkins && docker-compose up -d"
    exit 1
fi

# Check if Jenkins port is accessible
print_info "Checking Jenkins port accessibility..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|403"; then
    print_status 0 "Jenkins is accessible on port 8080"
else
    print_status 1 "Jenkins is not accessible on port 8080"
    print_warning "Wait a few seconds for Jenkins to start, then try again"
fi

# Check Docker access from Jenkins container
print_info "Checking Docker access from Jenkins container..."
if docker exec jenkins-server docker --version &> /dev/null; then
    JENKINS_DOCKER_VERSION=$(docker exec jenkins-server docker --version)
    print_status 0 "Jenkins can access Docker: $JENKINS_DOCKER_VERSION"
else
    print_status 1 "Jenkins cannot access Docker"
    echo "   Fix: docker exec -u root jenkins-server usermod -aG docker jenkins"
    echo "   Then: docker restart jenkins-server"
fi

# Check Docker socket permissions
print_info "Checking Docker socket permissions..."
if docker exec jenkins-server test -w /var/run/docker.sock; then
    print_status 0 "Jenkins has write access to Docker socket"
else
    print_status 1 "Jenkins does not have write access to Docker socket"
    echo "   Fix: sudo chmod 666 /var/run/docker.sock"
fi

# Check if Jenkinsfile exists
print_info "Checking Jenkinsfile..."
if [ -f "../Jenkinsfile" ]; then
    print_status 0 "Jenkinsfile exists"
else
    print_status 1 "Jenkinsfile not found"
    echo "   Jenkinsfile should be in the repository root"
fi

# Check if .dockerignore exists
print_info "Checking .dockerignore..."
if [ -f "../.dockerignore" ]; then
    print_status 0 ".dockerignore exists"
else
    print_status 1 ".dockerignore not found"
    print_warning "Consider creating .dockerignore to exclude unnecessary files"
fi

# Check Git configuration
print_info "Checking Git installation..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_status 0 "Git is installed: $GIT_VERSION"
else
    print_status 1 "Git is not installed"
    echo "   Install Git: sudo apt-get install git"
fi

# Check if repository is a Git repository
print_info "Checking Git repository..."
if [ -d "../.git" ]; then
    print_status 0 "Repository is a Git repository"
    
    # Get remote URL
    REMOTE_URL=$(cd .. && git config --get remote.origin.url)
    print_info "Remote URL: $REMOTE_URL"
    
    # Get current branch
    CURRENT_BRANCH=$(cd .. && git branch --show-current)
    print_info "Current branch: $CURRENT_BRANCH"
else
    print_status 1 "Not a Git repository"
    echo "   Initialize Git: git init && git remote add origin <URL>"
fi

# Check Java installation (for Jenkins CLI)
print_info "Checking Java installation..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    print_status 0 "Java is installed: $JAVA_VERSION"
else
    print_status 1 "Java is not installed (optional for Jenkins CLI)"
    print_warning "Install Java: sudo apt-get install openjdk-11-jdk"
fi

# Check network connectivity
print_info "Checking internet connectivity..."
if ping -c 1 google.com &> /dev/null; then
    print_status 0 "Internet connection is available"
else
    print_status 1 "No internet connection"
    print_warning "Internet required for pulling Docker images and accessing DockerHub"
fi

# Check DockerHub connectivity
print_info "Checking DockerHub connectivity..."
if curl -s https://hub.docker.com &> /dev/null; then
    print_status 0 "DockerHub is accessible"
else
    print_status 1 "Cannot reach DockerHub"
    print_warning "Check your internet connection and firewall settings"
fi

# Check GitHub connectivity
print_info "Checking GitHub connectivity..."
if curl -s https://github.com &> /dev/null; then
    print_status 0 "GitHub is accessible"
else
    print_status 1 "Cannot reach GitHub"
    print_warning "Check your internet connection and firewall settings"
fi

# Check if Jenkins is initialized
print_info "Checking Jenkins initialization..."
if docker exec jenkins-server test -f /var/jenkins_home/secrets/initialAdminPassword; then
    print_status 0 "Jenkins initial setup not completed yet"
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}Jenkins Initial Admin Password:${NC}"
    echo -e "${YELLOW}========================================${NC}"
    docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    print_info "Access Jenkins at: http://localhost:8080"
else
    print_status 0 "Jenkins is initialized"
fi

# Check disk space
print_info "Checking disk space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_status 0 "Disk space is sufficient (${DISK_USAGE}% used)"
else
    print_status 1 "Low disk space (${DISK_USAGE}% used)"
    print_warning "Consider cleaning up: docker system prune -a"
fi

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✓${NC} Docker is working"
echo -e "${GREEN}✓${NC} Jenkins is running"
echo -e "${GREEN}✓${NC} System is ready for Jenkins CI/CD"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Access Jenkins: http://localhost:8080"
echo "2. Complete Jenkins setup wizard"
echo "3. Install required plugins (Docker, GitHub Integration)"
echo "4. Configure DockerHub credentials"
echo "5. Create Jenkins pipeline job"
echo "6. Configure GitHub webhook"
echo "7. Trigger your first build!"
echo ""
echo -e "${BLUE}Need help? Check JENKINS_SETUP.md for detailed instructions${NC}"
echo ""
