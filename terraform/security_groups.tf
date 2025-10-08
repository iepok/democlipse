resource "aws_security_group" "db" {
  name        = "democlipse-db-sg"
  description = "Allow PostgreSQL access for Democlipse"

  ingress {
    description = "PostgreSQL from anywhere (dev)"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
