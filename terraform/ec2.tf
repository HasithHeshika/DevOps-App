# EC2 Instance Configuration for PropertyHub

# SSH Key Pair
resource "aws_key_pair" "main" {
  key_name   = var.key_name
  public_key = file("~/.ssh/id_rsa.pub")

  tags = {
    Name = "${var.project_name}-keypair-${var.environment}"
  }
}

# Application Server Instance
resource "aws_instance" "app_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.main.key_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.app_server.id]

  # User data script to setup Docker and deploy application
  user_data = templatefile("${path.module}/userdata.sh", {
    dockerhub_username     = var.dockerhub_username
    project_name           = var.project_name
    mongodb_root_password  = var.mongodb_root_password
  })

  # Root volume configuration
  root_block_device {
    volume_size           = 20  # GB (Free tier: 30 GB)
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = false

    tags = {
      Name = "${var.project_name}-root-volume-${var.environment}"
    }
  }

  # Instance metadata options
  metadata_options {
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
    http_endpoint               = "enabled"
  }

  # Enable detailed monitoring (additional charges may apply)
  monitoring = false  # Set to true for detailed CloudWatch metrics

  # Protect against accidental termination
  disable_api_termination = false

  tags = {
    Name        = "${var.project_name}-app-server-${var.environment}"
    Role        = "application"
    Application = "PropertyHub"
    OS          = "Ubuntu-22.04"
  }

  # Wait for instance to be ready
  provisioner "local-exec" {
    command = "echo 'Waiting for instance to be ready...'; sleep 30"
  }
}

# Elastic IP for Static Public IP
resource "aws_eip" "app_server" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip-${var.environment}"
  }

  # Ensure proper cleanup order
  depends_on = [aws_internet_gateway.main]
}

# Optional: Additional EBS Volume for Data
# resource "aws_ebs_volume" "data" {
#   availability_zone = aws_instance.app_server.availability_zone
#   size              = 10  # GB
#   type              = "gp3"
#   encrypted         = true
#
#   tags = {
#     Name = "${var.project_name}-data-volume-${var.environment}"
#   }
# }

# resource "aws_volume_attachment" "data_attachment" {
#   device_name = "/dev/sdf"
#   volume_id   = aws_ebs_volume.data.id
#   instance_id = aws_instance.app_server.id
# }

# CloudWatch Alarm for High CPU Usage
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-high-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300  # 5 minutes
  statistic           = "Average"
  threshold           = 80   # Alert if CPU > 80%
  alarm_description   = "Alert when CPU exceeds 80%"
  alarm_actions       = []   # Add SNS topic ARN for notifications

  dimensions = {
    InstanceId = aws_instance.app_server.id
  }

  tags = {
    Name = "${var.project_name}-cpu-alarm-${var.environment}"
  }
}

# CloudWatch Alarm for Instance Status Check
resource "aws_cloudwatch_metric_alarm" "instance_health" {
  alarm_name          = "${var.project_name}-instance-health-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 0
  alarm_description   = "Alert when instance status check fails"

  dimensions = {
    InstanceId = aws_instance.app_server.id
  }

  tags = {
    Name = "${var.project_name}-health-alarm-${var.environment}"
  }
}
