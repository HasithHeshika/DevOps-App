# PropertyHub AWS Deployment - Manual Steps Guide

## 🎯 What I've Created vs What You Need to Do

---

## ✅ COMPLETED (By AI)

All these files have been created for you:

### 1. Terraform Infrastructure Files
- ✓ `terraform/main.tf` - Main Terraform configuration
- ✓ `terraform/variables.tf` - Variable definitions
- ✓ `terraform/vpc.tf` - VPC and networking
- ✓ `terraform/security-groups.tf` - Security rules
- ✓ `terraform/ec2.tf` - EC2 instance configuration
- ✓ `terraform/outputs.tf` - Output values
- ✓ `terraform/userdata.sh` - EC2 initialization script
- ✓ `terraform/.gitignore` - Git ignore rules
- ✓ `terraform/terraform.tfvars.example` - Example variables

### 2. Deployment Scripts
- ✓ `scripts/deploy-to-aws.sh` - Automated deployment script
- ✓ `scripts/health-check.sh` - Health monitoring script

### 3. Jenkins Pipeline
- ✓ `Jenkinsfile.aws` - AWS deployment pipeline

### 4. Documentation
- ✓ `AWS_DEPLOYMENT_GUIDE.md` - Complete deployment guide

---

## 📋 MANUAL STEPS REQUIRED (By You)

### **PHASE 1: Pre-Deployment Setup** (One-Time)

#### **Step 1: Verify SSH Key Exists**

```bash
# Check if SSH key exists
ls -la ~/.ssh/id_rsa*

# If not exists, create one:
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

# Verify
cat ~/.ssh/id_rsa.pub
```

✅ **Verification**: You should see `id_rsa` and `id_rsa.pub` files

---

#### **Step 2: Verify AWS CLI Configuration**

```bash
# Test AWS credentials
aws sts get-caller-identity

# Should show:
# - UserId
# - Account
# - Arn

# If not configured, run:
aws configure
# Enter: Access Key ID, Secret Access Key, Region (ap-south-1), format (json)
```

✅ **Verification**: Command returns your AWS account information

---

#### **Step 3: Choose AWS Region and Get AMI ID**

**Option A: Use ap-south-1 (Mumbai) - Default**
- Already configured in variables.tf
- AMI ID: `ami-0c2af51e265bd5e0e`
- No changes needed

**Option B: Use Different Region**

1. Choose your region:
   - `us-east-1` (N. Virginia)
   - `us-west-2` (Oregon)
   - `eu-west-1` (Ireland)

2. Get Ubuntu 22.04 AMI for your region:
   ```bash
   # Example for us-east-1
   aws ec2 describe-images \
     --region us-east-1 \
     --owners 099720109477 \
     --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
     --query 'sort_by(Images, &CreationDate)[-1].[ImageId,Name]' \
     --output text
   ```

3. Update `terraform/terraform.tfvars` (next step)

---

### **PHASE 2: Terraform Configuration**

#### **Step 4: Create terraform.tfvars File**

```bash
cd ~/Documents/GitHub/DevOps-App/terraform

# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

**Update these values:**

```hcl
# YOUR AWS region
aws_region = "ap-south-1"

# YOUR DockerHub username (IMPORTANT!)
dockerhub_username = "hasithheshika"

# Strong password for MongoDB
mongodb_root_password = "YourStrongPassword@2026!"

# If using different region, update AMI ID
ami_id = "ami-0c2af51e265bd5e0e"

# Optional: Restrict SSH to your IP only (more secure)
# Get your IP: curl ifconfig.me
# allowed_ssh_cidr = ["YOUR_IP/32"]
```

**Save and exit** (Ctrl+O, Enter, Ctrl+X)

✅ **Verification**: File `terraform.tfvars` exists with your values

---

#### **Step 5: Initialize Terraform**

```bash
# Still in terraform directory
terraform init
```

**Expected Output:**
```
Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
...
Terraform has been successfully initialized!
```

✅ **Verification**: See "successfully initialized" message

---

#### **Step 6: Validate Configuration**

```bash
terraform validate
```

**Expected Output:**
```
Success! The configuration is valid.
```

✅ **Verification**: No errors shown

---

#### **Step 7: Preview What Will Be Created**

```bash
terraform plan
```

**Expected Output:**
```
Plan: 15 to add, 0 to change, 0 to destroy.
```

**Review the plan - it will create:**
- 1 VPC
- 2 Subnets (public, private)
- 1 Internet Gateway
- 1 Route Table
- 2 Security Groups
- 1 SSH Key Pair
- 1 EC2 Instance (t2.micro)
- 1 Elastic IP
- 2 CloudWatch Alarms

✅ **Verification**: Plan shows resources to be created

---

### **PHASE 3: Deploy to AWS**

#### **Step 8: Deploy Infrastructure**

```bash
# Deploy everything to AWS
terraform apply
```

**You'll see:**
```
Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value:
```

**Type:** `yes` and press Enter

**⏱️ Wait time:** 5-10 minutes

**Expected Output:**
```
Apply complete! Resources: 15 added, 0 changed, 0 destroyed.

Outputs:

app_server_public_ip = "13.126.XXX.XXX"
frontend_url = "http://13.126.XXX.XXX"
backend_url = "http://13.126.XXX.XXX:5000"
...
```

✅ **Verification**: See "Apply complete!" and IP address

---

#### **Step 9: Save Server IP**

```bash
# Save IP to environment variable
export SERVER_IP=$(terraform output -raw app_server_public_ip)

# Verify
echo "Server IP: $SERVER_IP"

# View all outputs
terraform output
```

✅ **Verification**: You see the public IP address

---

### **PHASE 4: Verify Deployment**

#### **Step 10: Wait for Application Setup**

The EC2 instance is now running a setup script that:
1. Installs Docker
2. Installs Docker Compose
3. Pulls your images from DockerHub
4. Starts the application

**⏱️ Wait time:** 5-10 minutes

**Monitor progress:**
```bash
# SSH into server
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP

# Watch the setup log
tail -f /var/log/user-data.log

# Press Ctrl+C to stop watching

# Check if deployment is complete
cat /home/ubuntu/deployment-complete.txt

# Exit SSH
exit
```

✅ **Verification**: See "PropertyHub deployment completed successfully"

---

#### **Step 11: Check Container Status**

```bash
# SSH into server
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP

# Go to application directory
cd /home/ubuntu/propertyhub

# Check containers
docker-compose ps

# Should show 3 containers running:
# - propertyhub-mongo (healthy)
# - propertyhub-backend (healthy)
# - propertyhub-frontend (healthy)

# View logs
docker-compose logs --tail=50

# Exit SSH
exit
```

✅ **Verification**: All 3 containers are "Up" and "healthy"

---

#### **Step 12: Test Application**

```bash
# Test frontend
curl http://$SERVER_IP

# Should return HTML

# Test backend API
curl http://$SERVER_IP:5000/api/health

# Should return: {"status":"ok"} or similar

# Open in browser
xdg-open http://$SERVER_IP  # Linux
```

✅ **Verification**: Application loads in browser

---

### **PHASE 5: Jenkins Integration** (Optional but Recommended)

#### **Step 13: Add AWS SSH Key to Jenkins**

1. Open Jenkins: `http://localhost:8080`

2. Navigate: **Manage Jenkins** → **Credentials** → **System** → **Global credentials**

3. Click **Add Credentials**

4. Fill form:
   - **Kind**: `SSH Username with private key`
   - **Scope**: `Global`
   - **ID**: `aws-ssh-key` (MUST BE EXACTLY THIS)
   - **Description**: `AWS EC2 SSH Key`
   - **Username**: `ubuntu`
   - **Private Key**: Select **Enter directly**
   
5. Copy your private key:
   ```bash
   cat ~/.ssh/id_rsa
   ```
   
6. Paste into Jenkins text area

7. Click **Create**

✅ **Verification**: Credential `aws-ssh-key` appears in list

---

#### **Step 14: Create Jenkins AWS Pipeline Job**

1. Jenkins Dashboard → **New Item**

2. **Name**: `PropertyHub-AWS-Deploy`

3. **Type**: `Pipeline`

4. Click **OK**

5. **Configure:**

   **General:**
   - Description: `Deploy PropertyHub to AWS EC2`
   - ☑️ **GitHub project**: `https://github.com/HasithHeshika/DevOps-App/`
   - ☑️ **Discard old builds**: Max 10

   **Build Triggers:**
   - ☑️ **GitHub hook trigger for GITScm polling**

   **Pipeline:**
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/HasithHeshika/DevOps-App.git`
   - **Credentials**: Select your GitHub credentials
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile.aws`

6. Click **Save**

✅ **Verification**: Job appears in Jenkins dashboard

---

#### **Step 15: Test Jenkins Pipeline**

1. Click on `PropertyHub-AWS-Deploy` job

2. Click **Build Now**

3. Watch build progress (takes ~10-15 minutes)

4. **Expected stages:**
   - ✅ Checkout
   - ✅ Verify Tools
   - ✅ Build Docker Images
   - ✅ Test Images
   - ✅ Login to DockerHub
   - ✅ Push to DockerHub
   - ✅ Get Infrastructure Info
   - ✅ Deploy to AWS
   - ✅ Health Check
   - ✅ Cleanup Local

5. Check Console Output for success message

✅ **Verification**: All stages show green checkmarks

---

### **PHASE 6: Commit Infrastructure Code** (Important!)

#### **Step 16: Commit Terraform and Scripts to Git**

```bash
cd ~/Documents/GitHub/DevOps-App

# Check what's new
git status

# Add Terraform files (EXCEPT .tfvars)
git add terraform/*.tf
git add terraform/userdata.sh
git add terraform/.gitignore
git add terraform/terraform.tfvars.example

# Add scripts
git add scripts/*.sh

# Add Jenkins and docs
git add Jenkinsfile.aws
git add AWS_DEPLOYMENT_GUIDE.md
git add MANUAL_STEPS.md

# Commit
git commit -m "feat: Add Terraform AWS infrastructure and deployment pipeline

- Add complete Terraform configuration for AWS deployment
- Add VPC, subnets, security groups, EC2 instance
- Add automated deployment and health check scripts
- Add Jenkins AWS pipeline with deployment stages
- Add comprehensive AWS deployment documentation
- Configure auto-deployment with Docker containers"

# Push to GitHub
git push origin main
```

**⚠️ CRITICAL:** Make sure `terraform.tfvars` is NOT committed (it's in .gitignore)

✅ **Verification**: Code pushed to GitHub, terraform.tfvars NOT visible

---

## 🎯 TESTING CHECKLIST

After completing all steps, verify everything works:

### Infrastructure Tests
- [ ] `terraform output` shows all values
- [ ] Can SSH to server: `ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP`
- [ ] Containers are running: `docker-compose ps`
- [ ] Frontend accessible in browser
- [ ] Backend API responds: `curl http://$SERVER_IP:5000/api/health`

### Jenkins Tests
- [ ] Jenkins can connect to AWS (ssh-agent works)
- [ ] Pipeline builds successfully
- [ ] Pipeline deploys to AWS
- [ ] Health checks pass

### End-to-End Test
- [ ] Make code change
- [ ] Push to GitHub
- [ ] Jenkins automatically builds
- [ ] Jenkins deploys to AWS
- [ ] Application updates on EC2

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: "InvalidKeyPair.NotFound"
**Solution:**
```bash
ls -la ~/.ssh/id_rsa.pub
# If not exists:
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
```

### Issue 2: "UnauthorizedOperation"
**Solution:**
```bash
aws sts get-caller-identity
# If fails:
aws configure
# Re-enter credentials
```

### Issue 3: Cannot SSH to Server
**Solution:**
```bash
# Check security group allows your IP
curl ifconfig.me
# Update terraform.tfvars allowed_ssh_cidr with your IP
terraform apply
```

### Issue 4: Containers Not Running
**Solution:**
```bash
ssh -i ~/.ssh/id_rsa ubuntu@$SERVER_IP
tail -f /var/log/user-data.log
# Wait for "PropertyHub deployment completed"
```

### Issue 5: Jenkins Cannot Deploy
**Solution:**
- Verify `aws-ssh-key` credential exists in Jenkins
- Check ID is exactly `aws-ssh-key` (case-sensitive)
- Test SSH manually first

---

## 💰 COST MANAGEMENT

### To Save Costs (When Not Using):

```bash
# Method 1: Destroy everything
cd ~/Documents/GitHub/DevOps-App/terraform
terraform destroy
# Type 'yes' when prompted

# Method 2: Just stop instance
aws ec2 stop-instances --instance-ids $(terraform output -raw instance_id)

# Restart later:
aws ec2 start-instances --instance-ids $(terraform output -raw instance_id)
```

### Re-deploy Later:

```bash
cd ~/Documents/GitHub/DevOps-App/terraform
terraform apply
# Type 'yes'
# Wait 10 minutes
# Application will be back!
```

---

## 📞 HELP & RESOURCES

- **AWS Console**: https://console.aws.amazon.com/
- **Terraform Docs**: https://www.terraform.io/docs/
- **Complete Guide**: See `AWS_DEPLOYMENT_GUIDE.md`
- **Quick Commands**: See `AWS_DEPLOYMENT_GUIDE.md` → Quick Reference

---

## ✅ COMPLETION CHECKLIST

Mark these off as you complete:

**Pre-Deployment:**
- [ ] SSH key exists (~/.ssh/id_rsa)
- [ ] AWS CLI configured
- [ ] Terraform installed

**Configuration:**
- [ ] Created terraform.tfvars with my values
- [ ] Updated DockerHub username
- [ ] Chose AWS region

**Deployment:**
- [ ] Run `terraform init`
- [ ] Run `terraform validate`
- [ ] Run `terraform plan` (reviewed)
- [ ] Run `terraform apply` (completed)
- [ ] Saved SERVER_IP

**Verification:**
- [ ] SSH works
- [ ] Containers running
- [ ] Frontend loads
- [ ] Backend API responds

**Jenkins (Optional):**
- [ ] Added AWS SSH key to Jenkins
- [ ] Created pipeline job
- [ ] Test build succeeded
- [ ] Auto-deployment works

**Git:**
- [ ] Committed Terraform files
- [ ] Pushed to GitHub
- [ ] Verified .tfvars NOT committed

---

**You're ready to deploy! Follow the steps in order and you'll have your application running on AWS!** 🚀

**Next Step:** Start with Phase 1, Step 1 above.
