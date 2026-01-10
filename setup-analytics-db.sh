#!/bin/bash

# Setup script for Analytics Demo Database in Docker

echo "=========================================="
echo "Analytics Demo Database Setup"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start the PostgreSQL container
echo ""
echo "Starting PostgreSQL container..."
docker-compose -f docker-compose.analytics.yml up -d

# Wait for PostgreSQL to be ready
echo ""
echo "Waiting for PostgreSQL to be ready..."
sleep 5

# Check if container is running
if ! docker ps | grep -q analytics_postgres; then
    echo "Error: Container failed to start. Check logs with: docker-compose -f docker-compose.analytics.yml logs"
    exit 1
fi

# Wait for PostgreSQL to accept connections
echo "Waiting for database to accept connections..."
for i in {1..30}; do
    if docker exec analytics_postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Error: PostgreSQL did not become ready in time."
        exit 1
    fi
    sleep 1
done

# The SQL file will be automatically executed by the init script
echo ""
echo "Database initialization script will run automatically on first startup."
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Connection Details:"
echo "  Host: localhost"
echo "  Port: 5433"
echo "  Database: analytics_demo"
echo "  Username: postgres"
echo "  Password: postgres"
echo ""
echo "To connect using psql:"
echo "  psql -h localhost -p 5433 -U postgres -d analytics_demo"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.analytics.yml logs -f"
echo ""
echo "To stop the container:"
echo "  docker-compose -f docker-compose.analytics.yml down"
echo ""
echo "To stop and remove data:"
echo "  docker-compose -f docker-compose.analytics.yml down -v"
echo ""
