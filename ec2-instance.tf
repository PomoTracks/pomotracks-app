provider "aws" {
  region = "ap-southeast-2"
}

# Get the latest Amazon Linux 2 AMI
 data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_key_pair" "generated" {
  key_name   = "terraform-key"
  public_key = file(pathexpand("~/.ssh/id_rsa.pub"))
}

resource "aws_instance" "example" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t2.micro"
  key_name      = aws_key_pair.generated.key_name

  tags = {
    Name = "TerraformExampleInstance"
  }
}

output "instance_public_ip" {
  value = aws_instance.example.public_ip
  description = "The public IP of the EC2 instance."
} 