# Terraform Outputs for PropertyHub Infrastructure

# Network Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "private_subnet_id" {
  description = "ID of the private subnet"
  value       = aws_subnet.private.id
}

# EC2 Instance Outputs
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app_server.id
}

output "instance_state" {
  description = "State of the EC2 instance"
  value       = aws_instance.app_server.instance_state
}

output "instance_type" {
  description = "Type of the EC2 instance"
  value       = aws_instance.app_server.instance_type
}

# IP Address Outputs
output "app_server_public_ip" {
  description = "Public IP address of the application server"
  value       = aws_eip.app_server.public_ip
}

output "app_server_private_ip" {
  description = "Private IP address of the application server"
  value       = aws_instance.app_server.private_ip
}

output "app_server_public_dns" {
  description = "Public DNS name of the application server"
  value       = aws_instance.app_server.public_dns
}

# Application URLs
output "frontend_url" {
  description = "URL to access the frontend application"
  value       = "http://${aws_eip.app_server.public_ip}"
}

output "backend_url" {
  description = "URL to access the backend API"
  value       = "http://${aws_eip.app_server.public_ip}:5000"
}

output "backend_health_check" {
  description = "Backend health check endpoint"
  value       = "http://${aws_eip.app_server.public_ip}:5000/api/health"
}

# SSH Access
output "ssh_command" {
  description = "SSH command to connect to the server"
  value       = "ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app_server.public_ip}"
}

output "ssh_key_name" {
  description = "Name of the SSH key pair"
  value       = aws_key_pair.main.key_name
}

# Security Group
output "security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app_server.id
}

# Monitoring
output "cloudwatch_cpu_alarm" {
  description = "CloudWatch CPU alarm ARN"
  value       = aws_cloudwatch_metric_alarm.high_cpu.arn
}

output "cloudwatch_health_alarm" {
  description = "CloudWatch health check alarm ARN"
  value       = aws_cloudwatch_metric_alarm.instance_health.arn
}

# Quick Access Commands
output "useful_commands" {
  description = "Useful commands for managing the deployment"
  value = <<-EOT
    # SSH into server
    ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app_server.public_ip}
    
    # View application logs
    ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app_server.public_ip} "cd /home/ubuntu/propertyhub && docker-compose logs -f"
    
    # Check container status
    ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app_server.public_ip} "cd /home/ubuntu/propertyhub && docker-compose ps"
    
    # Restart application
    ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app_server.public_ip} "cd /home/ubuntu/propertyhub && docker-compose restart"
    
    # Update application (pull latest images)
    ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app_server.public_ip} "cd /home/ubuntu/propertyhub && docker-compose pull && docker-compose up -d"
    
    # View deployment info
    ssh -i ~/.ssh/id_rsa ubuntu@${aws_eip.app_server.public_ip} "cat /home/ubuntu/propertyhub/deployment-info.txt"
  EOT
}

# Deployment Information
output "deployment_info" {
  description = "Deployment information summary"
  value = {
    region            = var.aws_region
    environment       = var.environment
    project_name      = var.project_name
    instance_type     = var.instance_type
    ami_id            = var.ami_id
    dockerhub_user    = var.dockerhub_username
    frontend_url      = "http://${aws_eip.app_server.public_ip}"
    backend_url       = "http://${aws_eip.app_server.public_ip}:5000"
    deployment_date   = timestamp()
  }
}

# Cost Estimation (approximate for free tier)
output "estimated_monthly_cost" {
  description = "Estimated monthly cost (USD) - assumes free tier"
  value = <<-EOT
    EC2 t2.micro: $0 (free tier: 750 hrs/month)
    EBS Storage (20 GB): $0 (free tier: 30 GB)
    Elastic IP: $0 (when attached to running instance)
    Data Transfer: $0 (free tier: 15 GB/month)
    
    Total: $0/month (within free tier limits)
    
    Note: Charges apply if exceeding free tier limits or after 12 months
  EOT
}
