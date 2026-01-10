# Analytics Demo Database - Docker Setup

This guide will help you set up the `analytics_demo` PostgreSQL database in Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (usually included with Docker Desktop)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Make sure Docker Desktop is running**

2. **Start the PostgreSQL container:**
   ```bash
   docker-compose -f docker-compose.analytics.yml up -d
   ```

3. **Wait for the database to initialize** (about 10-15 seconds)

4. **Verify the setup:**
   ```bash
   docker exec -it analytics_postgres psql -U postgres -d analytics_demo -c "SELECT COUNT(*) FROM users;"
   ```

### Option 2: Using PowerShell Script (Windows)

```powershell
.\setup-analytics-db.ps1
```

### Option 3: Using Bash Script (Linux/Mac)

```bash
chmod +x setup-analytics-db.sh
./setup-analytics-db.sh
```

## Connection Details

Once the container is running, you can connect using:

- **Host:** `localhost`
- **Port:** `5433` (to avoid conflicts with existing PostgreSQL on 5432)
- **Database:** `analytics_demo`
- **Username:** `postgres`
- **Password:** `postgres`

## Connecting to the Database

### Using psql (Command Line)

```bash
psql -h localhost -p 5433 -U postgres -d analytics_demo
```

### Using Docker exec

```bash
docker exec -it analytics_postgres psql -U postgres -d analytics_demo
```

### Connection String

```
postgresql://postgres:postgres@localhost:5433/analytics_demo
```

## Database Schema

The database includes the following tables:

1. **users** - User information with country data
2. **products** - Product catalog with categories and prices
3. **orders** - Order records with status
4. **order_items** - Order line items with quantities
5. **payments** - Payment transactions

## Sample Analytics Queries

### Total Revenue
```sql
SELECT 
    SUM(oi.quantity * oi.price) as total_revenue,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT o.user_id) as total_customers
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed';
```

### Orders per Day
```sql
SELECT 
    order_date,
    COUNT(*) as order_count,
    SUM(oi.quantity * oi.price) as daily_revenue
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY order_date
ORDER BY order_date;
```

### Top Products
```sql
SELECT 
    p.name,
    p.category,
    SUM(oi.quantity) as total_quantity_sold,
    SUM(oi.quantity * oi.price) as total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC
LIMIT 10;
```

### Users by Country
```sql
SELECT 
    country,
    COUNT(*) as user_count,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY country
ORDER BY user_count DESC;
```

## Managing the Container

### View Logs
```bash
docker-compose -f docker-compose.analytics.yml logs -f
```

### Stop the Container
```bash
docker-compose -f docker-compose.analytics.yml down
```

### Stop and Remove All Data
```bash
docker-compose -f docker-compose.analytics.yml down -v
```

### Restart the Container
```bash
docker-compose -f docker-compose.analytics.yml restart
```

### Check Container Status
```bash
docker ps | grep analytics_postgres
```

## Troubleshooting

### Docker is not running
- Make sure Docker Desktop is installed and running
- Check Docker status: `docker info`

### Port 5433 is already in use
- Change the port in `docker-compose.analytics.yml`:
  ```yaml
  ports:
    - "5434:5432"  # Change 5433 to 5434 or another port
  ```

### Database initialization failed
- Check logs: `docker-compose -f docker-compose.analytics.yml logs`
- Remove the volume and restart:
  ```bash
  docker-compose -f docker-compose.analytics.yml down -v
  docker-compose -f docker-compose.analytics.yml up -d
  ```

### Cannot connect to database
- Wait a few seconds for PostgreSQL to fully start
- Verify container is running: `docker ps`
- Check if port is accessible: `netstat -an | findstr 5433`

## Data Persistence

The database data is stored in a Docker volume named `analytics_postgres_data`. This means:
- Data persists even if you stop the container
- To completely remove data, use `docker-compose down -v`
- To backup data, export the volume or use `pg_dump`

## Using with Schema Intelligence App

To use this database with the Schema Intelligence app:

1. Extract the schema using the provided script:
   ```bash
   cd backend/scripts
   node extract-schema.js
   ```

2. Update the connection string in the extraction script to:
   ```
   postgresql://postgres:postgres@localhost:5433/analytics_demo
   ```

3. Upload the generated schema JSON to the app

## Security Note

⚠️ **Important:** The default credentials (postgres/postgres) are for development only. 
For production use, change the password in `docker-compose.analytics.yml`:

```yaml
environment:
  POSTGRES_PASSWORD: your_secure_password_here
```
