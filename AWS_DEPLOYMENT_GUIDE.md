# PropertyHub AWS Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Configuration](#aws-configuration)
3. [Terraform Deployment](#terraform-deployment)
4. [Application Verification](#application-verification)
5. [Jenkins CI/CD Setup](#jenkins-cicd-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Cost Management](#cost-management)

---

## 1. Prerequisites

### ✅ What You Need:
- [x] AWS Free Tier Account
- [x] AWS CLI installed and configured
- [x] Terraform installed (v1.0+)
- [x] SSH key pair generated (`~/.ssh/id_rsa`)
- [x] Git repository with code
- [x] DockerHub account with images

### Verify Installations:
```bash
# Check AWS CLI
aws --version
aws sts get-caller-identity

# Check Terraform
terraform version

# Check SSH key exists
ls -la ~/.ssh/id_rsa*

# Check Docker
docker --version
```

---

## 2. AWS Configuration

### Step 1: Configure AWS Credentials

If not already configured:
```bash
aws configure

# Enter your credentials:
# AWS Access Key ID: [from IAM user]
# AWS Secret Access Key: [from IAM user]
# Default region: ap-south-1
# Default output format: json
```

### Step 2: Verify AWS Access
```bash
# Test AWS connectivity
aws ec2 describe-regions --output table

# Check your identity
aws sts get-caller-identity
```

### Step 3: Choose AWS Region

Available regions for free tier:
- `ap-south-1` (Mumbai, India)
- `us-east-1` (N. Virginia, USA)
- `us-west-2` (Oregon, USA)
- `eu-west-1` (Ireland)

Update in `terraform/variables.tf` if needed.

---

## 3. Terraform Deployment

### Step 1: Navigate to Terraform Directory
```bash
cd ~/Documents/GitHub/DevOps-App/terraform
```

### Step 2: Review and Update Variables

Check `terraform.tfvars.example` and create your own:
```bash
# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

Update these values:
```hcl
aws_region         = "ap-south-1"        # Your preferred region
dockerhub_username = "hasithheshika"     # YOUR DockerHub username
mongodb_root_password = "YourStrongPassword123!"
```

**⚠️ Important:** Never commit `terraform.tfvars` to Git!

### Step 3: Initialize Terraform
```bash
# Initialize Terraform (downloads providers)
terraform init

# Expected output:
# ✓ Terraform has been successfully initialized!
```

### Step 4: Validate Configuration
```bash
# Validate syntax
terraform validate

# Expected output:
# ✓ Success! The configuration is valid.
```

### Step 5: Plan Deployment
```bash
# See what will be created
terraform plan

# Review the output:
# - VPC, Subnets, Internet Gateway
# - Security Groups
# - EC2 Instance (t2.micro)
# - Elastic IP
# - CloudWatch Alarms
```

### Step 6: Deploy Infrastructure
```bash
# Apply the configuration
terraform apply

# Type 'yes' when prompted

# ⏱️ This takes 5-10 minutes
```

### Step 7: Save Outputs
```bash
# Get all outputs
terraform output

# Save important information:
export SERVER_IP=$(terraform output -raw app_server_public_ip)
echo "Server IP: $SERVER_IP"

# View all useful commands
terraform output useful_commands
```

---

## 4. Application Verification

### Step 1: Wait for Deployment

The EC2 user data script automatically:
1. Installs Docker & Docker Compose
2. Pulls your images from DockerHub
3. Starts the application
4. Configures auto-start on boot

**Wait 5-10 minutes** for initial setup to complete.

### Step 2: Check Deployment Status

```bash
# SSH into the server
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP

# Check if deployment is complete
cat /home/ubuntu/deployment-complete.txt

# View deployment log
tail -100 /var/log/user-data.log

# Check container status
cd /home/ubuntu/propertyhub
docker-compose ps

# View logs
docker-compose logs -f

# Exit SSH
exit
```

### Step 3: Test Application

```bash
# Test frontend
curl http://$SERVER_IP
# Should return HTML

# Test backend API
curl http://$SERVER_IP:5000/api/health
# Should return: {"status":"ok"}

# Open in browser
xdg-open http://$SERVER_IP      # Linux
open http://$SERVER_IP          # macOS
```

### Step 4: Access Application URLs

```bash
# Get URLs from Terraform
terraform output frontend_url
terraform output backend_url

# Or manually
echo "Frontend: http://$SERVER_IP"
echo "Backend:  http://$SERVER_IP:5000"
```

---

## 5. Jenkins CI/CD Setup

### Step 1: Add AWS SSH Key to Jenkins

1. Open Jenkins: http://localhost:8080
2. Navigate: **Manage Jenkins** → **Credentials**
3. Click **Add Credentials**
4. Configure:
   - **Kind**: `SSH Username with private key`
   - **ID**: `aws-ssh-key`
   - **Username**: `ubuntu`
   - **Private Key**: Click **Enter directly**
     ```bash
     # Copy your private key
     cat ~/.ssh/id_rsa
     # Paste into Jenkins
     ```
5. Click **Create**

### Step 2: Create New Jenkins Job

1. Jenkins Dashboard → **New Item**
2. **Name**: `PropertyHub-AWS-Deploy`
3. **Type**: Pipeline
4. Click **OK**

### Step 3: Configure Pipeline Job

**General Section:**
- ☑️ **GitHub project**: `https://github.com/HasithHeshika/DevOps-App/`
- ☑️ **Discard old builds**: Keep last 10

**Build Triggers:**
- ☑️ **GitHub hook trigger for GITScm polling**

**Pipeline Configuration:**
- **Definition**: `Pipeline script from SCM`
- **SCM**: `Git`
- **Repository URL**: `https://github.com/HasithHeshika/DevOps-App.git`
- **Credentials**: Select your GitHub credentials
- **Branch**: `*/main`
- **Script Path**: `Jenkinsfile.aws`

Click **Save**

### Step 4: Test Pipeline

1. Click **Build Now**
2. Watch the pipeline stages:
   - Checkout
   - Build Images
   - Push to DockerHub
   - Deploy to AWS
   - Health Check
3. Verify successful completion

---

## 6. Monitoring & Maintenance

### CloudWatch Monitoring

AWS automatically monitors your instance:

1. Go to AWS Console → CloudWatch → Alarms
2. You'll see alarms for:
   - High CPU Usage (>80%)
   - Instance Health Check Failures

### Manual Monitoring

```bash
# SSH into server
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP

# Check container status
docker-compose ps

# View resource usage
docker stats

# Check disk space
df -h

# View logs
docker-compose logs --tail=100 -f

# Check system resources
htop
```

### Automated Health Checks

Use the provided health check script:
```bash
cd ~/Documents/GitHub/DevOps-App/scripts
./health-check.sh
```

### Update Application

Two methods:

**Method 1: Using Script**
```bash
cd ~/Documents/GitHub/DevOps-App/scripts
./deploy-to-aws.sh
```

**Method 2: Manual**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP
cd /home/ubuntu/propertyhub
docker-compose pull
docker-compose up -d
docker system prune -f
```

**Method 3: Automatic (Jenkins)**
- Push code to GitHub
- Jenkins automatically builds and deploys

---

## 7. Troubleshooting

### Issue 1: Cannot SSH to Server

**Symptoms:**
```bash
ssh: connect to host [IP] port 22: Connection refused
```

**Solutions:**
```bash
# 1. Check if instance is running
aws ec2 describe-instances \
  --filters "Name=tag:Project,Values=propertyhub" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' \
  --output table

# 2. Check security group allows your IP
# Get your current IP
curl ifconfig.me

# Update security group if needed
# Or set allowed_ssh_cidr in terraform.tfvars to your IP

# 3. Verify SSH key permissions
chmod 600 ~/.ssh/id_rsa
ls -la ~/.ssh/id_rsa
```

### Issue 2: Application Not Accessible

**Check:**
```bash
# 1. SSH into server
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP

# 2. Check containers
docker-compose ps

# 3. Check logs
docker-compose logs

# 4. Restart if needed
docker-compose restart

# 5. Check if deployment completed
cat /home/ubuntu/deployment-complete.txt
tail -f /var/log/user-data.log
```

### Issue 3: Terraform Apply Fails

**Common errors:**

**Error: "InvalidKeyPair.NotFound"**
```bash
# SSH key doesn't exist
# Solution: Ensure ~/.ssh/id_rsa.pub exists
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
```

**Error: "UnauthorizedOperation"**
```bash
# AWS credentials issue
# Solution: Reconfigure AWS CLI
aws configure
aws sts get-caller-identity
```

**Error: "Resource already exists"**
```bash
# Resource name conflict
# Solution: Destroy and recreate
terraform destroy
terraform apply
```

### Issue 4: Out of Free Tier Limits

**Check usage:**
```bash
# View EC2 instances
aws ec2 describe-instances --output table

# Stop instance to save hours
aws ec2 stop-instances --instance-ids i-xxxxx

# Start instance
aws ec2 start-instances --instance-ids i-xxxxx

# Or use Terraform
terraform destroy  # Removes everything
terraform apply    # Recreates when needed
```

### Issue 5: Containers Not Starting

```bash
# SSH into server
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP

# Check Docker service
sudo systemctl status docker

# Check disk space
df -h

# View detailed logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Restart containers
docker-compose down
docker-compose up -d
```

---

## 8. Cost Management

### AWS Free Tier Limits

**What's Free (First 12 months):**
- ✅ EC2: 750 hours/month of t2.micro
- ✅ EBS: 30 GB storage
- ✅ Data Transfer: 15 GB/month outbound
- ✅ Elastic IP: Free when attached to running instance

**Potential Charges:**
- ❌ Running instance > 750 hours/month
- ❌ Using instance type other than t2.micro
- ❌ Data transfer > 15 GB/month
- ❌ Elastic IP attached to stopped instance ($0.005/hour)
- ❌ Snapshots and additional EBS volumes

### Cost Monitoring

```bash
# Check current month's usage
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-01-31 \
  --granularity MONTHLY \
  --metrics UnblendedCost

# Set up billing alerts in AWS Console:
# CloudWatch → Billing → Create Alarm
```

### Save Costs

**When not using:**
```bash
# Stop instance (saves compute hours)
terraform destroy

# Keep instance but stop it
aws ec2 stop-instances --instance-ids $(terraform output -raw instance_id)

# Restart when needed
aws ec2 start-instances --instance-ids $(terraform output -raw instance_id)
```

**For development:**
- Deploy only when testing
- Use `terraform destroy` after testing
- Schedule auto-stop using CloudWatch Events

---

## 📊 Architecture Diagram

```
GitHub Repository
       ↓
   [Push Code]
       ↓
Jenkins CI/CD ──────→ DockerHub
       ↓                  ↓
   [Terraform]      [Pull Images]
       ↓                  ↓
   AWS Cloud ←───────────┘
       │
       ├─ VPC (10.0.0.0/16)
       │   ├─ Public Subnet (10.0.1.0/24)
       │   └─ Private Subnet (10.0.2.0/24)
       │
       ├─ EC2 Instance (t2.micro)
       │   ├─ Docker Engine
       │   ├─ Frontend Container (Port 80)
       │   ├─ Backend Container (Port 5000)
       │   └─ MongoDB Container (Port 27017)
       │
       ├─ Elastic IP
       ├─ Security Groups
       └─ CloudWatch Monitoring
```

---

## 🎯 Quick Reference Commands

```bash
# Terraform
cd ~/Documents/GitHub/DevOps-App/terraform
terraform init        # Initialize
terraform plan        # Preview changes
terraform apply       # Deploy
terraform destroy     # Remove all resources
terraform output      # Show outputs

# AWS
aws ec2 describe-instances
aws ec2 stop-instances --instance-ids i-xxxxx
aws ec2 start-instances --instance-ids i-xxxxx

# SSH Access
export SERVER_IP=$(cd terraform && terraform output -raw app_server_public_ip)
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP

# Deployment
cd ~/Documents/GitHub/DevOps-App/scripts
./deploy-to-aws.sh
./health-check.sh

# Application Management
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP "cd /home/ubuntu/propertyhub && docker-compose ps"
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP "cd /home/ubuntu/propertyhub && docker-compose logs -f"
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP "cd /home/ubuntu/propertyhub && docker-compose restart"
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP "cd /home/ubuntu/propertyhub && docker-compose pull && docker-compose up -d"
```

---

## 📞 Support & Resources

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Terraform Documentation**: https://www.terraform.io/docs/
- **Docker Documentation**: https://docs.docker.com/
- **Project Repository**: https://github.com/HasithHeshika/DevOps-App

---

**Last Updated**: January 22, 2026
**Created By**: Hasith Heshika
**Project**: PropertyHub DevOps Assessment
