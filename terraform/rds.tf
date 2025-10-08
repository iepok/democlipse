resource "aws_db_instance" "main" {
  identifier     = "democlipse-postgres"
  engine         = "postgres"
  engine_version = "16.1"
  instance_class = "db.t3.micro"

  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = true

  skip_final_snapshot = true

  backup_retention_period = 0  # no backups for dev
}
