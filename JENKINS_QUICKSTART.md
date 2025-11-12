# Jenkins CI/CD Setup - Quick Start Guide

## 🚀 Complete Setup in 10 Steps

Follow these steps **in order** to set up Jenkins CI/CD for pushing Docker images to DockerHub.

---

## Step 1: Install Jenkins with Docker

Choose **ONE** option:

### Option A: Using the provided docker-compose (RECOMMENDED)

```bash
cd /home/hasith-heshika/Documents/GitHub/DevOps-App/jenkins
docker-compose up -d
```

### Option B: Install Jenkins directly on Ubuntu

```bash
# Install Java
sudo apt update
sudo apt install openjdk-11-jdk -y

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Add jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**✓ Verification:**
```bash
# Check if Jenkins is running
docker ps | grep jenkins
# OR
sudo systemctl status jenkins
```

---

## Step 2: Get Jenkins Initial Password

### If using Docker:
```bash
docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
```

### If installed directly:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Copy this password** - you'll need it in the next step!

---

## Step 3: Access Jenkins Web Interface

1. Open browser and go to:
   ```
   http://localhost:8080
   ```

2. Paste the initial admin password

3. Click **"Continue"**

**✓ Verification:** You should see the "Customize Jenkins" page

---

## Step 4: Install Jenkins Plugins

1. Select **"Install suggested plugins"**

2. Wait for installation (5-10 minutes)

3. After default plugins install, go to:
   - **Manage Jenkins** → **Manage Plugins** → **Available**

4. Search and install these additional plugins:
   - ☑️ **Docker Pipeline**
   - ☑️ **Docker**
   - ☑️ **GitHub Integration**

5. Check **"Restart Jenkins when installation is complete and no jobs are running"**

6. Wait for Jenkins to restart

7. Log back in

**✓ Verification:** All plugins show "Success" with checkmarks

---

## Step 5: Create Jenkins Admin User

1. Fill in the form:
   - **Username**: `admin`
   - **Password**: `[choose-strong-password]`
   - **Confirm password**: `[same-password]`
   - **Full name**: `Admin`
   - **E-mail**: `your-email@example.com`

2. Click **"Save and Continue"**

3. Keep default URL: `http://localhost:8080/`

4. Click **"Save and Finish"**

5. Click **"Start using Jenkins"**

**✓ Verification:** You see the Jenkins dashboard

---

## Step 6: Add DockerHub Credentials to Jenkins

1. From Jenkins dashboard, click **"Manage Jenkins"**

2. Click **"Credentials"**

3. Click **"(global)"** domain

4. Click **"Add Credentials"**

5. Fill in:
   - **Kind**: `Username with password`
   - **Scope**: `Global (Jenkins, nodes, items, all child items, etc)`
   - **Username**: `hasithheshika01` ← **REPLACE with YOUR DockerHub username**
   - **Password**: `[your-dockerhub-password-or-token]`
   - **ID**: `dockerhub-credentials` ← **IMPORTANT: Use exactly this ID**
   - **Description**: `DockerHub credentials for pushing images`

6. Click **"Create"**

### To get DockerHub Access Token (Recommended instead of password):

1. Go to https://hub.docker.com/
2. Log in
3. Click your username → **Account Settings**
4. Click **Security** tab
5. Click **"New Access Token"**
6. Description: `Jenkins CI/CD`
7. Access permissions: `Read, Write, Delete`
8. Click **"Generate"**
9. **Copy the token** (you won't see it again!)
10. Use this token as the **Password** in Jenkins credentials

**✓ Verification:** You see the credential listed under "(global)"

---

## Step 7: Update Jenkinsfile with Your DockerHub Username

1. Open the Jenkinsfile in your repository:
   ```bash
   nano /home/hasith-heshika/Documents/GitHub/DevOps-App/Jenkinsfile
   ```

2. Find line 8 and **replace** `hasithheshika01` with **YOUR** DockerHub username:
   ```groovy
   DOCKERHUB_USERNAME = 'your-dockerhub-username'  // ← CHANGE THIS
   ```

3. Save the file (Ctrl+O, Enter, Ctrl+X)

4. Commit the change:
   ```bash
   cd /home/hasith-heshika/Documents/GitHub/DevOps-App
   git add Jenkinsfile
   git commit -m "Update DockerHub username in Jenkinsfile"
   ```

**✓ Verification:** 
```bash
grep "DOCKERHUB_USERNAME" Jenkinsfile
# Should show YOUR username
```

---

## Step 8: Create Jenkins Pipeline Job

1. From Jenkins dashboard, click **"New Item"**

2. Enter name: `PropertyHub-Docker-Build`

3. Select **"Pipeline"**

4. Click **"OK"**

5. **General Section:**
   - ☑️ Check **"GitHub project"**
   - Project URL: `https://github.com/HasithHeshika/DevOps-App/`

6. **Build Triggers:**
   - ☑️ Check **"GitHub hook trigger for GITScm polling"**

7. **Pipeline Section:**
   - **Definition**: Select `Pipeline script from SCM`
   - **SCM**: Select `Git`
   - **Repository URL**: `https://github.com/HasithHeshika/DevOps-App.git`
   - **Credentials**: Click **"Add"** → **"Jenkins"**
     - **Kind**: `Username with password`
     - **Username**: `[your-github-username]`
     - **Password**: `[your-github-personal-access-token]`
     - **ID**: `github-credentials`
     - **Description**: `GitHub credentials`
     - Click **"Add"**
   - Select the credential you just created
   - **Branches to build**: `*/main`
   - **Script Path**: `Jenkinsfile`

8. Click **"Save"**

### To create GitHub Personal Access Token:

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Note: `Jenkins CI/CD`
4. Expiration: `90 days` (or your preference)
5. Select scopes:
   - ☑️ `repo` (Full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token** (you won't see it again!)

**✓ Verification:** You see the pipeline job in Jenkins dashboard

---

## Step 9: Commit and Push All Changes to GitHub

1. Check what files are new:
   ```bash
   cd /home/hasith-heshika/Documents/GitHub/DevOps-App
   git status
   ```

2. Add all new Jenkins files:
   ```bash
   git add Jenkinsfile .dockerignore jenkins/ scripts/ JENKINS_SETUP.md
   git add .
   ```

3. Commit with descriptive message:
   ```bash
   git commit -m "feat: Add Jenkins CI/CD pipeline for DockerHub deployment

   - Add Jenkinsfile with complete pipeline stages
   - Add jenkins docker-compose for easy setup
   - Add comprehensive Jenkins setup documentation
   - Add verification script for Jenkins configuration
   - Add .dockerignore for optimized builds"
   ```

4. Push to GitHub:
   ```bash
   git push origin main
   ```

**✓ Verification:**
```bash
# Check push was successful
git log --oneline -1
# Should show your commit message
```

---

## Step 10: Trigger First Build

### Method A: Manual Build (Quick Test)

1. Go to Jenkins dashboard

2. Click on **"PropertyHub-Docker-Build"** job

3. Click **"Build Now"** on left sidebar

4. Watch build progress in **"Build History"**

5. Click on build `#1` to see details

6. Click **"Console Output"** to see logs

**Expected Duration:** 10-15 minutes for first build

**Expected Stages:**
- ✅ Checkout
- ✅ Verify Docker
- ✅ Build Backend Image
- ✅ Build Frontend Image
- ✅ Test Images
- ✅ Login to DockerHub
- ✅ Push Backend to DockerHub
- ✅ Push Frontend to DockerHub
- ✅ Cleanup

### Method B: Automatic Build via GitHub Webhook (Optional)

If you want automatic builds on every push:

1. Go to your GitHub repository: https://github.com/HasithHeshika/DevOps-App

2. Click **"Settings"** tab

3. Click **"Webhooks"** (left sidebar)

4. Click **"Add webhook"**

5. Fill in:
   - **Payload URL**: `http://YOUR_SERVER_IP:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: `Just the push event`
   - ☑️ **Active**

6. Click **"Add webhook"**

**Note:** If Jenkins is on localhost, GitHub can't reach it. You need either:
- Public IP address
- Use ngrok: `ngrok http 8080`
- Or stick with manual builds

**✓ Verification:**
- Build completes successfully (green checkmark)
- No red errors in console output

---

## 🎉 Final Verification

### Check DockerHub

1. Go to https://hub.docker.com/

2. Log in

3. Go to **Repositories**

4. You should see:
   - `your-username/propertyhub-backend`
   - `your-username/propertyhub-frontend`

5. Click on each repository

6. You should see 3 tags:
   - `latest`
   - `20251112-XXXXXX` (timestamp)
   - `abc1234` (git commit)

### Test the Images

```bash
# Pull images from DockerHub
docker pull your-username/propertyhub-backend:latest
docker pull your-username/propertyhub-frontend:latest

# Run the images
docker run -d -p 5000:5000 your-username/propertyhub-backend:latest
docker run -d -p 80:80 your-username/propertyhub-frontend:latest

# Test endpoints
curl http://localhost:5000  # Should get response
curl http://localhost:80    # Should get HTML
```

---

## 🔧 Verification Script

Run the automated verification script:

```bash
cd /home/hasith-heshika/Documents/GitHub/DevOps-App
./scripts/verify-jenkins-setup.sh
```

This will check:
- ✓ Docker installation
- ✓ Jenkins running
- ✓ Docker access from Jenkins
- ✓ Required files present
- ✓ Git configuration
- ✓ Network connectivity

---

## 📊 Pipeline Workflow

Here's what happens when you trigger a build:

```
1. Checkout          → Clone repository from GitHub
2. Verify Docker     → Check Docker is available
3. Build Backend     → Build backend Docker image
4. Build Frontend    → Build frontend Docker image
5. Test Images       → Verify images work correctly
6. Login DockerHub   → Authenticate with DockerHub
7. Push Backend      → Upload backend images (3 tags)
8. Push Frontend     → Upload frontend images (3 tags)
9. Cleanup           → Remove temporary files
```

**Total Time:** ~10-15 minutes (first build), ~5-8 minutes (subsequent builds)

---

## 🚨 Common Issues & Solutions

### Issue 1: "permission denied" for Docker socket

**Solution:**
```bash
# If using Docker Jenkins:
docker exec -u root jenkins-server usermod -aG docker jenkins
docker restart jenkins-server

# If installed directly:
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue 2: DockerHub login fails

**Solution:**
- Verify credentials ID is exactly `dockerhub-credentials`
- Check username and password are correct
- Use access token instead of password

### Issue 3: Jenkinsfile not found

**Solution:**
```bash
# Make sure Jenkinsfile is committed
cd /home/hasith-heshika/Documents/GitHub/DevOps-App
git add Jenkinsfile
git commit -m "Add Jenkinsfile"
git push origin main
```

### Issue 4: Build fails at push stage

**Solution:**
- Check DockerHub username in Jenkinsfile matches your actual username
- Verify DockerHub credentials are correct
- Check internet connectivity

---

## 📝 What You Need to Do Manually

### MUST DO:
1. ✓ Install Jenkins (Step 1)
2. ✓ Get initial password (Step 2)
3. ✓ Access web interface (Step 3)
4. ✓ Install plugins (Step 4)
5. ✓ Create admin user (Step 5)
6. ✓ Add DockerHub credentials (Step 6)
7. ✓ Update Jenkinsfile with YOUR username (Step 7)
8. ✓ Create pipeline job (Step 8)
9. ✓ Commit and push to GitHub (Step 9)
10. ✓ Trigger first build (Step 10)

### OPTIONAL:
- Configure GitHub webhook (for automatic builds)
- Set up email notifications
- Add Slack notifications
- Configure multi-branch pipeline
- Set up Jenkins backup

---

## 🎓 Next Steps After Setup

Once everything works:

1. **Make a code change:**
   ```bash
   # Edit a file
   echo "// Test change" >> backend/app.js
   
   # Commit and push
   git add backend/app.js
   git commit -m "test: Trigger Jenkins build"
   git push origin main
   ```

2. **Watch Jenkins automatically build and push** (if webhook configured)

3. **Verify new images on DockerHub** with new timestamp tag

4. **Pull and deploy new images:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## 📞 Need Help?

- **Detailed guide:** Read `JENKINS_SETUP.md`
- **Verification script:** Run `./scripts/verify-jenkins-setup.sh`
- **Jenkins docs:** https://www.jenkins.io/doc/
- **Docker docs:** https://docs.docker.com/

---

## 🎯 Quick Commands Reference

```bash
# Start Jenkins (Docker)
cd jenkins && docker-compose up -d

# Stop Jenkins
cd jenkins && docker-compose down

# View Jenkins logs
docker logs -f jenkins-server

# Get initial password
docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword

# Restart Jenkins
docker restart jenkins-server

# Check Docker access
docker exec jenkins-server docker ps

# Verify setup
./scripts/verify-jenkins-setup.sh

# Trigger build from CLI (after setup)
curl -X POST http://localhost:8080/job/PropertyHub-Docker-Build/build \
  --user admin:your-password
```

---

**Setup Time Estimate:**
- Jenkins installation: 10 minutes
- Plugin installation: 10 minutes  
- Configuration: 15 minutes
- First build: 15 minutes
- **Total: ~50 minutes**

**You're all set! 🚀**
