#!/bin/bash

echo "Starting ZG Bot application..."

# Build and start all services
docker-compose up --build -d

echo "Services starting..."
echo "Backend will be available at: http://localhost:8080"
echo "Frontend will be available at: http://localhost:3000"
echo "PostgreSQL will be available at: localhost:5432"

echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
echo ""
echo "To stop and remove volumes:"
echo "  docker-compose down -v"