@echo off
echo ========================================
echo PostgreSQL Database Setup
echo ========================================
echo.

echo Step 1: Creating database...
psql -U postgres -f create-database.sql

echo.
echo Step 2: Creating tables...
psql -U postgres -d llm_error_db -f src\database\schema.sql

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Database: llm_error_db
echo User: postgres
echo Host: localhost
echo Port: 5432
echo.
echo Next steps:
echo 1. Create .env file with your configuration
echo 2. Run: npm install
echo 3. Run: node test-db.js
echo.
pause
