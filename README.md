# PropertyHub - Online Land/Property Management System

A full-stack property management system built with the MERN stack (MongoDB, Express.js, React, Node.js) and containerized with Docker.

## 🚀 Features

- **User Authentication** - Secure login/signup with JWT
- **Property Listings** - Browse and filter properties
- **Property Management** - Add, edit, and manage properties
- **User Dashboard** - Personalized user experience
- **Responsive Design** - Works on all devices
- **RESTful API** - Clean and documented API endpoints
- **Docker Support** - Easy deployment with Docker containers

## 📋 Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)
- Git

## 🏃 Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/HasithHeshika/DevOps-App.git
cd DevOps-App

# Create backend environment file
cp backend/.env.example backend/.env

# Build and run
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Option 2: Using Build Script

```bash
# Clone the repository
git clone https://github.com/HasithHeshika/DevOps-App.git
cd DevOps-App

# Run the build script
./build-docker.sh
```

### Option 3: Build from GitHub Directly

```bash
# Build backend
docker build -t propertyhub-backend:latest \
  https://github.com/HasithHeshika/DevOps-App.git#main:backend

# Build frontend
docker build -t propertyhub-frontend:latest \
  https://github.com/HasithHeshika/DevOps-App.git#main:frontend
```

## 📖 Documentation

- [Docker Deployment Guide](DOCKER_DEPLOYMENT.md) - Comprehensive Docker deployment instructions
- [API Documentation](backend/README.md) - Backend API documentation
- [Frontend Guide](frontend/README.md) - Frontend development guide

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- CSS3
- Nginx (for production)

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Bcrypt

### DevOps
- Docker
- Docker Compose
- GitHub Actions (CI/CD)

## 📁 Project Structure

```
DevOps-App/
├── backend/              # Backend API server
│   ├── Controllers/      # Request handlers
│   ├── Model/           # Database models
│   ├── Routes/          # API routes
│   ├── Dockerfile       # Backend Docker config
│   └── server.js        # Entry point
├── frontend/            # React frontend
│   ├── public/          # Static files
│   ├── src/            
│   │   ├── Components/  # React components
│   │   └── Styles/      # CSS files
│   ├── Dockerfile       # Frontend Docker config
│   └── nginx.conf       # Nginx configuration
├── docker-compose.yml   # Docker Compose config
└── build-docker.sh      # Build automation script
```

## 🔧 Configuration

### Environment Variables

Backend (`backend/.env`):
```env
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/propertyhub
PORT=5000
FRONTEND_URL=http://localhost:3000
```

See `backend/.env.example` for all available options.

## 🐳 Docker Commands

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build [service]

# Remove all containers and volumes
docker-compose down -v
```

## 🚀 Deployment

### Deploy to Docker Hub

```bash
# Build and tag images
docker build -t yourusername/propertyhub-backend:latest ./backend
docker build -t yourusername/propertyhub-frontend:latest ./frontend

# Push to Docker Hub
docker login
docker push yourusername/propertyhub-backend:latest
docker push yourusername/propertyhub-frontend:latest
```

### GitHub Actions

The project includes automated CI/CD with GitHub Actions. Images are automatically built and pushed on:
- Push to main branch
- Tagged releases
- Pull requests (build only)

## 📝 Development

### Local Development (without Docker)

Backend:
```bash
cd backend
npm install
npm start
```

Frontend:
```bash
cd frontend
npm install
npm start
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Hasith Heshika**
- GitHub: [@HasithHeshika](https://github.com/HasithHeshika)
- Repository: [DevOps-App](https://github.com/HasithHeshika/DevOps-App)

## 🙏 Acknowledgments

- Created as part of DevOps Engineering module
- Built with MERN stack
- Containerized with Docker

## 📞 Support

For issues and questions:
- Open an issue on [GitHub Issues](https://github.com/HasithHeshika/DevOps-App/issues)
- Check the [Docker Deployment Guide](DOCKER_DEPLOYMENT.md) for detailed instructions

---

**Note:** This is a DevOps project demonstrating containerization and deployment using Docker.
