#!/bin/bash

echo "========================================"
echo " Snap & Report - Setup Script"
echo "========================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "[1/5] Setting up environment files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "Created backend/.env"
else
    echo "backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "Created frontend/.env"
else
    echo "frontend/.env already exists"
fi

echo ""
echo "[2/5] Building Docker containers..."
docker-compose build

echo ""
echo "[3/5] Starting services..."
docker-compose up -d

echo ""
echo "[4/5] Waiting for services to be ready..."
sleep 10

echo ""
echo "[5/5] Running database migrations..."
docker-compose exec -T backend python manage.py migrate

echo ""
echo "========================================"
echo " Setup Complete!"
echo "========================================"
echo ""
echo "Services are running at:"
echo "  - Frontend:   http://localhost:5173"
echo "  - Backend:    http://localhost:8000"
echo "  - Admin:      http://localhost:8000/admin"
echo "  - API Docs:   http://localhost:8000/api/docs"
echo "  - AI Service: http://localhost:8001/docs"
echo ""
echo "To create an admin user, run:"
echo "  docker-compose exec backend python manage.py createsuperuser"
echo ""
echo "To view logs, run:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services, run:"
echo "  docker-compose down"
echo ""
