terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Optional: Store state in S3 for team collaboration
  # Uncomment after creating S3 bucket
  # backend "s3" {
  #   bucket = "propertyhub-terraform-state"
  #   key    = "dev/terraform.tfstate"
  #   region = "ap-south-1"
  # }
}

provider "aws" {
  region = var.aws_region
  
  # Default tags applied to all resources
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      CreatedBy   = "Hasith Heshika"
      CostCenter  = "DevOps-Training"
    }
  }
}
