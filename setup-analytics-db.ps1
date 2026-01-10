# PowerShell script for Analytics Demo Database Setup in Docker

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Analytics Demo Database Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker and try again." -ForegroundColor Red
    exit 1
}

# Start the PostgreSQL container
Write-Host ""
Write-Host "Starting PostgreSQL container..." -ForegroundColor Yellow
docker-compose -f docker-compose.analytics.yml up -d

# Wait for PostgreSQL to be ready
Write-Host ""
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if container is running
$containerRunning = docker ps --filter "name=analytics_postgres" --format "{{.Names}}"
if (-not $containerRunning) {
    Write-Host "Error: Container failed to start. Check logs with: docker-compose -f docker-compose.analytics.yml logs" -ForegroundColor Red
    exit 1
}

# Wait for PostgreSQL to accept connections
Write-Host "Waiting for database to accept connections..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    try {
        $result = docker exec analytics_postgres pg_isready -U postgres 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "PostgreSQL is ready!" -ForegroundColor Green
            $ready = $true
            break
        }
    } catch {
        # Continue waiting
    }
    Start-Sleep -Seconds 1
    $attempt++
}

if (-not $ready) {
    Write-Host "Error: PostgreSQL did not become ready in time." -ForegroundColor Red
    exit 1
}

# The SQL file will be automatically executed by the init script
Write-Host ""
Write-Host "Database initialization script will run automatically on first startup." -ForegroundColor Green
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor Yellow
Write-Host "  Host: localhost"
Write-Host "  Port: 5433"
Write-Host "  Database: analytics_demo"
Write-Host "  Username: postgres"
Write-Host "  Password: postgres"
Write-Host ""
Write-Host "To connect using psql:" -ForegroundColor Yellow
Write-Host "  psql -h localhost -p 5433 -U postgres -d analytics_demo"
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.analytics.yml logs -f"
Write-Host ""
Write-Host "To stop the container:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.analytics.yml down"
Write-Host ""
Write-Host "To stop and remove data:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.analytics.yml down -v"
Write-Host ""
