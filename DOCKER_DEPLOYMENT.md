# PropertyHub - Docker Deployment Guide

## Building Docker Images from GitHub Repository

This guide explains how to build and run the PropertyHub application using Docker images built directly from the GitHub repository.

### Repository Information
- **Repository:** https://github.com/HasithHeshika/DevOps-App
- **Branch:** main

---

## Prerequisites

Before you begin, ensure you have the following installed:

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)
- Git (optional, if cloning manually)

---

## Method 1: Clone and Build Locally

### Step 1: Clone the Repository

```bash
git clone https://github.com/HasithHeshika/DevOps-App.git
cd DevOps-App
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration (or use the defaults for development).

### Step 3: Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build -d

# Or build images only (without starting)
docker-compose build
```

### Step 4: Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

---

## Method 2: Build Images Directly from GitHub (Advanced)

You can build Docker images directly from the GitHub repository without cloning:

### Build Backend Image

```bash
docker build \
  -t propertyhub-backend:latest \
  -f backend/Dockerfile \
  https://github.com/HasithHeshika/DevOps-App.git#main:backend
```

### Build Frontend Image

```bash
docker build \
  -t propertyhub-frontend:latest \
  -f frontend/Dockerfile \
  https://github.com/HasithHeshika/DevOps-App.git#main:frontend
```

### Run the Built Images

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:6-jammy
    container_name: propertyhub-mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: propertyhub
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - propertyhub-network

  backend:
    image: propertyhub-backend:latest
    container_name: propertyhub-backend
    restart: unless-stopped
    environment:
      JWT_SECRET: your-super-secret-jwt-key-change-this
      JWT_EXPIRES_IN: 7d
      MONGODB_URI: mongodb://admin:password123@mongo:27017/propertyhub?authSource=admin
      FRONTEND_URL: http://localhost:3000
      NODE_ENV: production
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      - mongo
    networks:
      - propertyhub-network

  frontend:
    image: propertyhub-frontend:latest
    container_name: propertyhub-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - propertyhub-network

networks:
  propertyhub-network:
    driver: bridge

volumes:
  mongo_data:
    driver: local
```

Then run:

```bash
docker-compose up -d
```

---

## Method 3: Using Docker Hub (Publishing Images)

### Step 1: Build and Tag Images

```bash
# Build backend
docker build -t yourusername/propertyhub-backend:latest ./backend
docker build -t yourusername/propertyhub-backend:v1.0.0 ./backend

# Build frontend
docker build -t yourusername/propertyhub-frontend:latest ./frontend
docker build -t yourusername/propertyhub-frontend:v1.0.0 ./frontend
```

### Step 2: Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push images
docker push yourusername/propertyhub-backend:latest
docker push yourusername/propertyhub-backend:v1.0.0
docker push yourusername/propertyhub-frontend:latest
docker push yourusername/propertyhub-frontend:v1.0.0
```

### Step 3: Pull and Run from Docker Hub

```bash
# Pull images
docker pull yourusername/propertyhub-backend:latest
docker pull yourusername/propertyhub-frontend:latest

# Update docker-compose.yml to use your images
# Then run
docker-compose up -d
```

---

## Method 4: GitHub Actions CI/CD (Automated)

Create `.github/workflows/docker-build.yml`:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_USERNAME }}
        password: ${{ secrets.DOCKER_PASSWORD }}
    
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: ./backend
        push: true
        tags: yourusername/propertyhub-backend:latest
    
    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: ./frontend
        push: true
        tags: yourusername/propertyhub-frontend:latest
```

---

## Quick Commands Reference

```bash
# Clone repository
git clone https://github.com/HasithHeshika/DevOps-App.git
cd DevOps-App

# Build and run (development)
docker-compose up --build -d

# Stop containers
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v

# View logs
docker-compose logs -f [service_name]

# Rebuild specific service
docker-compose build [service_name]
docker-compose up -d [service_name]

# Execute commands in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Clean up everything
docker-compose down -v --rmi all
```

---

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :5000
sudo lsof -i :27017

# Stop conflicting containers
docker ps
docker stop <container_id>
```

### Permission Issues

```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

### Image Build Fails

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Container Won't Start

```bash
# Check logs
docker-compose logs [service_name]

# Check container status
docker-compose ps

# Inspect container
docker inspect [container_name]
```

---

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/propertyhub |
| `PORT` | Backend server port | 5000 |
| `NODE_ENV` | Node environment | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

### MongoDB Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_INITDB_ROOT_USERNAME` | MongoDB admin username | admin |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB admin password | password123 |
| `MONGO_INITDB_DATABASE` | Initial database name | propertyhub |

---

## Production Deployment Recommendations

1. **Change Default Passwords**: Update MongoDB credentials in production
2. **Use Strong JWT Secret**: Generate a strong secret key
3. **Enable HTTPS**: Use a reverse proxy (Nginx/Traefik) with SSL
4. **Set Resource Limits**: Add memory and CPU limits in docker-compose.yml
5. **Use Docker Secrets**: For sensitive data in production
6. **Enable Health Checks**: Already configured in Dockerfiles
7. **Set Up Logging**: Configure centralized logging
8. **Regular Backups**: Backup MongoDB data volume
9. **Monitor Resources**: Use Prometheus/Grafana or similar

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/HasithHeshika/DevOps-App/issues
- Repository: https://github.com/HasithHeshika/DevOps-App

---

## License

[Your License Here]
