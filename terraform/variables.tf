variable "aws_region" {
  description = "AWS region to deploy resources in"
  type = string
  default = "il-central-1"
}

variable "aws_fallback_region" {
  description = "Fallback region for services unavailable in il-central-1"
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "democlipse"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "democlipse"
}
