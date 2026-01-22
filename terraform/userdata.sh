#!/bin/bash
set -e

# Log file for debugging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=========================================="
echo "PropertyHub Application Setup Starting..."
echo "=========================================="
date

# Update system packages
echo "1. Updating system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y

# Install essential tools
echo "2. Installing essential tools..."
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    net-tools \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo "3. Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# Install Docker Compose
echo "4. Installing Docker Compose..."
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/$${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installations
echo "5. Verifying installations..."
docker --version
docker-compose --version

# Create application directory
echo "6. Creating application directory..."
mkdir -p /home/ubuntu/${project_name}
cd /home/ubuntu/${project_name}

# Create environment file
echo "7. Creating environment configuration..."
cat > .env <<EOF
# MongoDB Configuration
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=${mongodb_root_password}
MONGODB_DATABASE=${project_name}

# Backend Configuration
NODE_ENV=production
PORT=5000
JWT_SECRET=$(openssl rand -base64 32)
FRONTEND_URL=http://localhost

# Docker Configuration
DOCKERHUB_USERNAME=${dockerhub_username}
EOF

# Create docker-compose file
echo "8. Creating docker-compose configuration..."
cat > docker-compose.yml <<'EOFCOMPOSE'
version: '3.8'

services:
  mongodb:
    image: mongo:6-jammy
    container_name: ${project_name}-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: $${MONGODB_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: $${MONGODB_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: $${MONGODB_DATABASE}
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - ${project_name}-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s

  backend:
    image: ${dockerhub_username}/${project_name}-backend:latest
    container_name: ${project_name}-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: $${NODE_ENV}
      PORT: $${PORT}
      MONGODB_URI: mongodb://$${MONGODB_ROOT_USERNAME}:$${MONGODB_ROOT_PASSWORD}@mongodb:27017/$${MONGODB_DATABASE}?authSource=admin
      JWT_SECRET: $${JWT_SECRET}
      FRONTEND_URL: $${FRONTEND_URL}
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - ${project_name}-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: ${dockerhub_username}/${project_name}-frontend:latest
    container_name: ${project_name}-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "3000:80"
    depends_on:
      - backend
    networks:
      - ${project_name}-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local

networks:
  ${project_name}-network:
    driver: bridge
EOFCOMPOSE

# Pull latest images from DockerHub
echo "9. Pulling Docker images from DockerHub..."
docker-compose pull

# Start the application
echo "10. Starting PropertyHub application..."
docker-compose up -d

# Wait for services to be healthy
echo "11. Waiting for services to be healthy..."
sleep 30

# Check service status
echo "12. Checking service status..."
docker-compose ps

# Create systemd service for auto-start on boot
echo "13. Creating systemd service..."
cat > /etc/systemd/system/${project_name}.service <<EOFSYSTEMD
[Unit]
Description=PropertyHub Application
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/${project_name}
ExecStartPre=/usr/local/bin/docker-compose pull
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
ExecReload=/usr/local/bin/docker-compose pull && /usr/local/bin/docker-compose up -d
User=ubuntu
Group=ubuntu
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOFSYSTEMD

# Enable and start the service
systemctl daemon-reload
systemctl enable ${project_name}.service

# Set proper permissions
chown -R ubuntu:ubuntu /home/ubuntu/${project_name}

# Create deployment info file
echo "14. Creating deployment information..."
cat > /home/ubuntu/${project_name}/deployment-info.txt <<EOFINFO
========================================
PropertyHub Deployment Information
========================================
Deployment Date: $(date)
Project: ${project_name}
Environment: Production

Container Status:
$(docker-compose ps)

Services:
- Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):80
- Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000
- MongoDB: Internal only (port 27017)

Logs Location:
- User Data Log: /var/log/user-data.log
- Docker Logs: docker-compose logs -f

Useful Commands:
- View logs: cd /home/ubuntu/${project_name} && docker-compose logs -f
- Restart services: cd /home/ubuntu/${project_name} && docker-compose restart
- Update images: cd /home/ubuntu/${project_name} && docker-compose pull && docker-compose up -d
- Stop services: cd /home/ubuntu/${project_name} && docker-compose down
- Check status: cd /home/ubuntu/${project_name} && docker-compose ps

========================================
EOFINFO

# Display deployment info
cat /home/ubuntu/${project_name}/deployment-info.txt

# Create completion marker
touch /home/ubuntu/deployment-complete.txt
echo "PropertyHub deployment completed successfully at $(date)" > /home/ubuntu/deployment-complete.txt

# Final status
echo "=========================================="
echo "PropertyHub Application Setup Complete!"
echo "=========================================="
echo "Frontend URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "Backend URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
echo "=========================================="

# Setup cron job for daily updates (optional)
cat > /etc/cron.daily/${project_name}-update <<EOFCRON
#!/bin/bash
cd /home/ubuntu/${project_name}
docker-compose pull >> /var/log/${project_name}-updates.log 2>&1
EOFCRON
chmod +x /etc/cron.daily/${project_name}-update

# Install monitoring tools (optional)
echo "15. Setting up monitoring..."
apt-get install -y sysstat

# Enable automatic security updates
echo "16. Enabling automatic security updates..."
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo "All setup tasks completed!"
