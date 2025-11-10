@echo off
echo ========================================
echo  Snap and Report - Setup Script
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Setting up environment files...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Created backend\.env
) else (
    echo backend\.env already exists
)

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo Created frontend\.env
) else (
    echo frontend\.env already exists
)

echo.
echo [2/5] Building Docker containers...
docker-compose build

echo.
echo [3/5] Starting services...
docker-compose up -d

echo.
echo [4/5] Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo [5/5] Running database migrations...
docker-compose exec -T backend python manage.py migrate

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Services are running at:
echo   - Frontend:  http://localhost:5173
echo   - Backend:   http://localhost:8000
echo   - Admin:     http://localhost:8000/admin
echo   - API Docs:  http://localhost:8000/api/docs
echo   - AI Service: http://localhost:8001/docs
echo.
echo To create an admin user, run:
echo   docker-compose exec backend python manage.py createsuperuser
echo.
echo To view logs, run:
echo   docker-compose logs -f
echo.
echo To stop services, run:
echo   docker-compose down
echo.
pause
