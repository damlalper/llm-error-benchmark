-- LLM Error Analysis Database Setup Script
-- Run this with: psql -U postgres -f create-database.sql

-- Drop database if exists (optional, uncomment if you want to recreate)
-- DROP DATABASE IF EXISTS llm_error_db;

-- Create database
CREATE DATABASE llm_error_db;

-- Success message
SELECT 'Database llm_error_db created successfully!' as message;
