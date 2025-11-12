# Jenkins CI/CD Pipeline Setup Guide for DockerHub Deployment

This guide will walk you through setting up Jenkins to automatically build and push Docker images to DockerHub from your GitHub repository.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Jenkins Installation](#jenkins-installation)
3. [Jenkins Initial Setup](#jenkins-initial-setup)
4. [Install Required Plugins](#install-required-plugins)
5. [Configure DockerHub Credentials](#configure-dockerhub-credentials)
6. [Create Jenkins Pipeline Job](#create-jenkins-pipeline-job)
7. [Configure GitHub Webhook](#configure-github-webhook)
8. [Trigger First Build](#trigger-first-build)
9. [Verify DockerHub](#verify-dockerhub)
10. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software
- **Operating System**: Linux (Ubuntu/Debian recommended)
- **Docker**: v20.10 or higher
- **Docker Compose**: v2.0 or higher
- **Java**: OpenJDK 11 or 17
- **Git**: Latest version

### Required Accounts
- **GitHub Account** with repository access
- **DockerHub Account** (free tier works)

### System Requirements
- Minimum 2GB RAM
- Minimum 10GB disk space
- Port 8080 available for Jenkins

---

## 2. Jenkins Installation

### Option A: Install Jenkins on Ubuntu/Debian

```bash
# Step 1: Update system packages
sudo apt update && sudo apt upgrade -y

# Step 2: Install Java (Jenkins requires Java)
sudo apt install openjdk-11-jdk -y

# Verify Java installation
java -version

# Step 3: Add Jenkins repository key
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

# Step 4: Add Jenkins repository
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Step 5: Install Jenkins
sudo apt update
sudo apt install jenkins -y

# Step 6: Start Jenkins service
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Step 7: Check Jenkins status
sudo systemctl status jenkins
```

### Option B: Run Jenkins in Docker (Quick Start)

```bash
# Create Jenkins volume for persistent data
docker volume create jenkins_home

# Run Jenkins container
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(which docker):/usr/bin/docker \
  --restart unless-stopped \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Option C: Using docker-compose (Recommended)

Create `jenkins/docker-compose.yml`:

```yaml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins-server
    privileged: true
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
    environment:
      - JENKINS_OPTS=--prefix=/jenkins
    restart: unless-stopped

volumes:
  jenkins_home:
    driver: local
```

```bash
# Start Jenkins
cd jenkins
docker-compose up -d

# Get initial password
docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## 3. Jenkins Initial Setup

### Step 1: Access Jenkins Web Interface

1. Open browser and navigate to:
   ```
   http://localhost:8080
   ```
   Or replace `localhost` with your server IP:
   ```
   http://YOUR_SERVER_IP:8080
   ```

### Step 2: Unlock Jenkins

1. **Get Initial Admin Password**:
   ```bash
   # If installed directly:
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   
   # If using Docker:
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```

2. **Copy the password** (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

3. **Paste into Jenkins unlock page**

### Step 3: Install Plugins

1. Select **"Install suggested plugins"**
2. Wait for installation to complete (5-10 minutes)

### Step 4: Create Admin User

1. Fill in the form:
   - **Username**: `admin` (or your choice)
   - **Password**: Create a strong password
   - **Full Name**: Your name
   - **Email**: Your email

2. Click **"Save and Continue"**

### Step 5: Instance Configuration

1. Keep default Jenkins URL: `http://localhost:8080/`
2. Click **"Save and Finish"**
3. Click **"Start using Jenkins"**

---

## 4. Install Required Plugins

### Step 1: Navigate to Plugin Manager

1. Click **"Manage Jenkins"** (left sidebar)
2. Click **"Manage Plugins"** or **"Plugins"**
3. Go to **"Available plugins"** tab

### Step 2: Install These Plugins

Search and install the following plugins (check boxes, then click "Install without restart"):

#### Essential Plugins:
1. **Docker Pipeline** - Docker integration for Jenkins Pipeline
2. **Docker** - Docker plugin for Jenkins
3. **GitHub Integration** - GitHub integration
4. **Git** - Git SCM support (usually pre-installed)
5. **Pipeline** - Pipeline support (usually pre-installed)
6. **Credentials Binding** - Credential binding support (usually pre-installed)
7. **Pipeline: Stage View** - Visual pipeline stage view
8. **Blue Ocean** (Optional) - Modern UI for Jenkins

### Step 3: Verify Installation

1. Check **"Restart Jenkins when installation is complete and no jobs are running"**
2. Wait for Jenkins to restart
3. Log back in with your admin credentials

---

## 5. Configure DockerHub Credentials

### Step 1: Navigate to Credentials

1. Click **"Manage Jenkins"** (left sidebar)
2. Click **"Credentials"**
3. Click **"(global)"** domain
4. Click **"Add Credentials"** (left sidebar)

### Step 2: Add DockerHub Credentials

1. **Kind**: Select `Username with password`
2. **Scope**: `Global (Jenkins, nodes, items, all child items, etc)`
3. **Username**: Your DockerHub username (e.g., `hasithheshika01`)
4. **Password**: Your DockerHub password or access token
5. **ID**: `dockerhub-credentials` (MUST match Jenkinsfile)
6. **Description**: `DockerHub credentials for pushing images`

7. Click **"Create"**

### Step 3: Create DockerHub Access Token (Recommended)

Instead of using your password, create an access token:

1. Go to [DockerHub](https://hub.docker.com/)
2. Log in to your account
3. Click your username → **"Account Settings"**
4. Go to **"Security"** tab
5. Click **"New Access Token"**
6. **Description**: `Jenkins CI/CD`
7. **Access permissions**: `Read, Write, Delete`
8. Click **"Generate"**
9. **Copy the token** (you won't see it again!)
10. Use this token as the **Password** in Jenkins credentials

---

## 6. Create Jenkins Pipeline Job

### Step 1: Create New Pipeline

1. From Jenkins dashboard, click **"New Item"** (left sidebar)
2. **Enter item name**: `PropertyHub-Docker-Build`
3. Select **"Pipeline"**
4. Click **"OK"**

### Step 2: Configure General Settings

1. **Description**: 
   ```
   CI/CD pipeline to build and push PropertyHub Docker images to DockerHub
   ```

2. ✅ Check **"GitHub project"**
   - **Project URL**: `https://github.com/HasithHeshika/DevOps-App/`

3. ✅ Check **"Discard old builds"**
   - **Max # of builds to keep**: `10`

### Step 3: Configure Build Triggers

✅ Check **"GitHub hook trigger for GITScm polling"**

This allows GitHub webhooks to trigger builds automatically.

### Step 4: Configure Pipeline

1. **Definition**: Select `Pipeline script from SCM`

2. **SCM**: Select `Git`

3. **Repository URL**: 
   ```
   https://github.com/HasithHeshika/DevOps-App.git
   ```

4. **Credentials**: 
   - Click **"Add"** → **"Jenkins"**
   - **Kind**: `Username with password`
   - **Username**: Your GitHub username
   - **Password**: Your GitHub Personal Access Token (PAT)
   - **ID**: `github-credentials`
   - **Description**: `GitHub credentials`
   - Click **"Add"**
   - Select the credentials you just created

5. **Branches to build**: 
   - **Branch Specifier**: `*/main` (or `*/master` if using master branch)

6. **Script Path**: `Jenkinsfile`

7. ✅ Check **"Lightweight checkout"** (optional, for faster checkout)

### Step 5: Save Configuration

Click **"Save"** at the bottom

---

## 7. Configure GitHub Webhook

### Step 1: Get Jenkins Webhook URL

Your Jenkins webhook URL format:
```
http://YOUR_JENKINS_URL:8080/github-webhook/
```

Example:
```
http://192.168.1.100:8080/github-webhook/
```

### Step 2: Add Webhook to GitHub

1. Go to your GitHub repository: `https://github.com/HasithHeshika/DevOps-App`

2. Click **"Settings"** tab

3. Click **"Webhooks"** (left sidebar)

4. Click **"Add webhook"**

5. **Payload URL**: 
   ```
   http://YOUR_JENKINS_URL:8080/github-webhook/
   ```
   ⚠️ **Important**: 
   - If Jenkins is on localhost, GitHub cannot reach it
   - Use public IP or services like ngrok for testing
   - For production, use a public domain

6. **Content type**: `application/json`

7. **Which events would you like to trigger this webhook?**
   - Select **"Just the push event"**

8. ✅ Check **"Active"**

9. Click **"Add webhook"**

### Step 3: Test Webhook (Optional)

1. After creating webhook, click on it
2. Go to **"Recent Deliveries"** tab
3. Click on a delivery to see response
4. Should see `200 OK` response

### Alternative: Use ngrok for Local Testing

If Jenkins is on localhost:

```bash
# Install ngrok
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Authenticate (get token from ngrok.com)
ngrok config add-authtoken YOUR_NGROK_TOKEN

# Create tunnel to Jenkins
ngrok http 8080

# Use the ngrok URL in GitHub webhook
# Example: https://abc123.ngrok.io/github-webhook/
```

---

## 8. Trigger First Build

### Method 1: Manual Build

1. Go to Jenkins dashboard
2. Click on **"PropertyHub-Docker-Build"** job
3. Click **"Build Now"** (left sidebar)
4. Watch the build progress in **"Build History"**
5. Click on build number (e.g., `#1`) to see details
6. Click **"Console Output"** to see logs

### Method 2: Git Push Trigger (Automatic)

1. Make any change to your repository:
   ```bash
   cd /home/hasith-heshika/Documents/GitHub/DevOps-App
   
   # Make a small change
   echo "# Jenkins CI/CD Enabled" >> README.md
   
   # Commit and push
   git add .
   git commit -m "test: Trigger Jenkins build"
   git push origin main
   ```

2. Jenkins should automatically detect the push and start building

3. Check Jenkins dashboard for new build

### Expected Build Stages

You should see these stages in the pipeline:

1. ✅ **Checkout** - Clone repository
2. ✅ **Verify Docker** - Check Docker installation
3. ✅ **Build Backend Image** - Build backend Docker image
4. ✅ **Build Frontend Image** - Build frontend Docker image
5. ✅ **Test Images** - Verify images work
6. ✅ **Login to DockerHub** - Authenticate with DockerHub
7. ✅ **Push Backend to DockerHub** - Upload backend images
8. ✅ **Push Frontend to DockerHub** - Upload frontend images
9. ✅ **Cleanup** - Remove temporary files

### Build Duration

- First build: ~10-15 minutes (downloading dependencies)
- Subsequent builds: ~5-8 minutes (using cache)

---

## 9. Verify DockerHub

### Step 1: Check DockerHub Repositories

1. Go to [DockerHub](https://hub.docker.com/)
2. Log in to your account
3. Click **"Repositories"**
4. You should see:
   - `hasithheshika01/propertyhub-backend`
   - `hasithheshika01/propertyhub-frontend`

### Step 2: Check Image Tags

For each repository, you should see 3 tags:
- `latest` - Most recent build
- `YYYYMMDD-HHMMSS` - Timestamp tag (e.g., `20251112-143022`)
- `abc1234` - Git commit hash (e.g., `7a8b9c0`)

### Step 3: Pull and Test Images

```bash
# Pull backend image
docker pull hasithheshika01/propertyhub-backend:latest

# Pull frontend image
docker pull hasithheshika01/propertyhub-frontend:latest

# Test running the images
docker run -d -p 5000:5000 hasithheshika01/propertyhub-backend:latest
docker run -d -p 80:80 hasithheshika01/propertyhub-frontend:latest

# Check running containers
docker ps

# Test endpoints
curl http://localhost:5000  # Backend
curl http://localhost:80     # Frontend
```

---

## 10. Troubleshooting

### Problem 1: "Permission denied" for Docker socket

**Symptom**: 
```
Got permission denied while trying to connect to the Docker daemon socket
```

**Solution**:

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# If using Docker Jenkins:
docker exec -u root jenkins-server usermod -aG docker jenkins
docker restart jenkins-server
```

### Problem 2: DockerHub login fails

**Symptom**:
```
Error: Cannot perform an interactive login from a non TTY device
```

**Solution**:

1. Verify credentials ID in Jenkinsfile matches Jenkins:
   - Jenkinsfile: `DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')`
   - Jenkins: Credentials ID must be `dockerhub-credentials`

2. Check credential format:
   - Type must be **"Username with password"**
   - Not "Secret text" or other types

3. Verify DockerHub username is correct in Jenkinsfile:
   ```groovy
   DOCKERHUB_USERNAME = 'hasithheshika01'  // Replace with YOUR username
   ```

### Problem 3: GitHub webhook not triggering

**Symptom**: Pushes to GitHub don't trigger Jenkins builds

**Solution**:

1. **Check webhook deliveries**:
   - GitHub → Settings → Webhooks → Click webhook → Recent Deliveries
   - Look for errors (red X)

2. **Jenkins is on localhost**:
   - Use ngrok to expose Jenkins:
     ```bash
     ngrok http 8080
     ```
   - Update GitHub webhook URL to ngrok URL

3. **Firewall blocking**:
   - Open port 8080 on your server:
     ```bash
     sudo ufw allow 8080
     ```

4. **Enable GitHub hook trigger in Jenkins**:
   - Job Configuration → Build Triggers → ✅ GitHub hook trigger for GITScm polling

### Problem 4: Build fails at "Build Backend/Frontend Image"

**Symptom**:
```
docker: command not found
```

**Solution**:

```bash
# Install Docker in Jenkins container
docker exec -u root jenkins-server bash -c "
  apt-get update && \
  apt-get install -y apt-transport-https ca-certificates curl && \
  curl -fsSL https://get.docker.com -o get-docker.sh && \
  sh get-docker.sh
"

# Or mount Docker binary (recommended):
# Already done in docker-compose.yml:
# - /usr/bin/docker:/usr/bin/docker
```

### Problem 5: "No such file or directory" - Jenkinsfile not found

**Symptom**:
```
ERROR: Jenkinsfile not found in repository
```

**Solution**:

1. Verify Jenkinsfile is committed:
   ```bash
   git add Jenkinsfile
   git commit -m "Add Jenkinsfile"
   git push origin main
   ```

2. Check Script Path in Jenkins job config:
   - Should be: `Jenkinsfile` (case-sensitive)

3. Verify branch name:
   - Jenkins job should use `*/main` (not `*/master`)

### Problem 6: Out of disk space

**Symptom**:
```
no space left on device
```

**Solution**:

```bash
# Remove old Docker images
docker system prune -a

# Remove old Jenkins builds
# In Jenkins job: Configure → Discard old builds → Max # of builds to keep: 5

# Remove old Docker volumes
docker volume prune
```

### Problem 7: Git authentication fails

**Symptom**:
```
fatal: Authentication failed for 'https://github.com/...'
```

**Solution**:

1. Create GitHub Personal Access Token:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy token

2. Update Jenkins credentials:
   - Manage Jenkins → Credentials → Update github-credentials
   - Password: Paste GitHub token

### Problem 8: Build succeeds but images not on DockerHub

**Symptom**: Pipeline shows success but images missing from DockerHub

**Solution**:

1. Check Console Output for push stage
2. Verify DockerHub credentials are correct
3. Check DockerHub repositories exist:
   ```bash
   # Create repositories on DockerHub website first
   # Or let first push create them automatically
   ```

4. Check image names match DockerHub username:
   - In Jenkinsfile: `DOCKERHUB_USERNAME = 'hasithheshika01'`
   - Must match your actual DockerHub username

---

## 🎯 Quick Reference Commands

### Jenkins Management

```bash
# Start Jenkins
sudo systemctl start jenkins

# Stop Jenkins
sudo systemctl stop jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Check status
sudo systemctl status jenkins

# View logs
sudo journalctl -u jenkins -f

# If using Docker:
docker logs -f jenkins-server
```

### Docker Commands

```bash
# View running containers
docker ps

# View all images
docker images

# Remove all images
docker rmi $(docker images -q)

# Clean up system
docker system prune -a

# Check Docker disk usage
docker system df
```

### Jenkins CLI (Optional)

```bash
# Download Jenkins CLI
wget http://localhost:8080/jnlpJars/jenkins-cli.jar

# Trigger build
java -jar jenkins-cli.jar -s http://localhost:8080/ build PropertyHub-Docker-Build
```

---

## 🔒 Security Best Practices

1. **Use Access Tokens**: 
   - DockerHub: Use access tokens instead of passwords
   - GitHub: Use Personal Access Tokens (PAT)

2. **Enable HTTPS**:
   - Configure Jenkins with SSL certificate
   - Use reverse proxy (Nginx) for HTTPS

3. **Restrict Jenkins Access**:
   - Enable authentication
   - Use role-based access control (RBAC)
   - Configure security realm

4. **Secure Credentials**:
   - Never commit credentials to Git
   - Use Jenkins credential store
   - Rotate credentials regularly

5. **Network Security**:
   - Use firewall rules
   - Limit Jenkins port access
   - Use VPN for remote access

---

## 📊 Pipeline Visualization

### Expected Pipeline Flow:

```
┌─────────────┐
│  Checkout   │
└──────┬──────┘
       │
┌──────▼──────┐
│Verify Docker│
└──────┬──────┘
       │
┌──────▼──────────────┐
│ Build Backend Image │
└──────┬──────────────┘
       │
┌──────▼───────────────┐
│Build Frontend Image  │
└──────┬───────────────┘
       │
┌──────▼──────┐
│Test Images  │
└──────┬──────┘
       │
┌──────▼────────────┐
│Login to DockerHub │
└──────┬────────────┘
       │
       ├──────────────────────┐
       │                      │
┌──────▼──────────┐  ┌────────▼────────────┐
│Push Backend to  │  │Push Frontend to     │
│   DockerHub     │  │    DockerHub        │
└──────┬──────────┘  └────────┬────────────┘
       │                      │
       └──────────┬───────────┘
                  │
           ┌──────▼──────┐
           │  Cleanup    │
           └─────────────┘
```

---

## 🎓 Next Steps

After successful setup:

1. **Enable Blue Ocean UI** (Optional):
   ```bash
   # Install Blue Ocean plugin
   # Access: http://localhost:8080/blue
   ```

2. **Add Email Notifications**:
   - Install "Email Extension" plugin
   - Configure SMTP settings
   - Add email notification to Jenkinsfile

3. **Add Slack Notifications**:
   - Install "Slack Notification" plugin
   - Configure Slack webhook
   - Add Slack notification to Jenkinsfile

4. **Set up Multi-branch Pipeline**:
   - Create pipeline for dev, staging, prod branches
   - Different DockerHub tags per branch

5. **Add Testing Stage**:
   - Unit tests
   - Integration tests
   - Security scanning

---

## 📝 Summary Checklist

Before starting, ensure you have:

- [ ] Ubuntu/Linux server or Docker environment
- [ ] Jenkins installed and running
- [ ] Docker installed on Jenkins host
- [ ] DockerHub account created
- [ ] GitHub repository accessible
- [ ] All required plugins installed
- [ ] DockerHub credentials configured in Jenkins
- [ ] GitHub credentials configured in Jenkins
- [ ] Jenkinsfile committed to repository
- [ ] Jenkins job created and configured
- [ ] GitHub webhook configured
- [ ] First build triggered successfully
- [ ] Images visible on DockerHub

---

**Need Help?**

- Jenkins Documentation: https://www.jenkins.io/doc/
- Docker Documentation: https://docs.docker.com/
- DockerHub: https://hub.docker.com/
- GitHub Webhooks: https://docs.github.com/en/webhooks

**Your Jenkins job URL**:
```
http://localhost:8080/job/PropertyHub-Docker-Build/
```

**Your DockerHub repositories**:
```
https://hub.docker.com/r/hasithheshika01/propertyhub-backend
https://hub.docker.com/r/hasithheshika01/propertyhub-frontend
```
