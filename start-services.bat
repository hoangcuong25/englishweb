@echo off
:: Batch script to start MySQL service and application servers
:: Run this file as Administrator to start MySQL service if stopped

echo [1/3] Kiem tra va khoi dong MySQL 8.0...
net start MYSQL80

echo [2/3] Khoi dong Backend NestJS (Port 3001)...
cd /d "%~dp0server"
start "EnglishWeb Backend" cmd /k "npm run start:dev"

echo [3/3] Khoi dong Frontend Next.js (Port 3000)...
cd /d "%~dp0client"
start "EnglishWeb Frontend" cmd /k "npm run dev"

echo ======================================================
echo He thong dang duoc khoi dong:
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:3001/api
echo - Swagger:  http://localhost:3001/api/docs
echo ======================================================
