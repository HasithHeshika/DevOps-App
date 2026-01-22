variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"  # Mumbai region (change if needed)
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "propertyhub"
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
  default     = "dev"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"  # Free tier eligible
}

variable "ami_id" {
  description = "Ubuntu AMI ID for EC2 instance"
  type        = string
  # Ubuntu 22.04 LTS in ap-south-1 (Mumbai)
  # Change if using different region - find AMI here: https://cloud-images.ubuntu.com/locator/ec2/
  default     = "ami-0c2af51e265bd5e0e"
}

variable "key_name" {
  description = "SSH key pair name"
  type        = string
  default     = "propertyhub-key"
}

variable "dockerhub_username" {
  description = "DockerHub username for pulling images"
  type        = string
  default     = "hasithheshika"
}

variable "mongodb_root_password" {
  description = "MongoDB root password"
  type        = string
  default     = "PropertyHub@2026!"
  sensitive   = true
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed to SSH (0.0.0.0/0 = anywhere, or use your IP)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
