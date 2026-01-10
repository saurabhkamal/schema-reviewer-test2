# Analytics Dashboard

A fully functional analytics dashboard that dynamically visualizes data from PostgreSQL databases.

## Features

### Backend APIs
- **Schema Discovery**: Dynamically fetch database schema (tables and columns)
- **Summary Metrics**: Get counts, totals, averages, min/max values
- **Time-Series Data**: Fetch time-based trends with date range filtering
- **Category Distributions**: Get distribution data for pie/donut charts
- **Top-N Entities**: Fetch top entities for bar charts

### Frontend Dashboard
- **KPI Cards**: Display key metrics (row count, totals, averages, max values)
- **Line Charts**: Visualize time-series trends
- **Bar Charts**: Show top entities
- **Pie Charts**: Display category distributions
- **Dynamic Schema Detection**: Automatically detects date, numeric, and text columns
- **Date Range Filtering**: Filter time-series data by date range
- **Table Selection**: Choose any table from the connected database

## Usage

### 1. Start the Backend

The backend should already be running. If not:

```bash
cd backend
npm run dev
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Connect to a Database

1. Navigate to the Analytics page in the app
2. Enter your PostgreSQL connection details:
   - **Host**: `localhost` (or your database host)
   - **Port**: `5433` (for analytics_demo) or `5432` (default)
   - **Database**: `analytics_demo` (or your database name)
   - **User**: `postgres` (or your username)
   - **Password**: `postgres` (or your password)
3. Click "Connect to Database"

### 4. View Analytics

Once connected:
- Select a table from the dropdown
- The dashboard will automatically:
  - Detect date columns for time-series charts
  - Detect numeric columns for metrics
  - Detect text columns for distributions
  - Generate appropriate visualizations

### 5. Filter Data

- Use the date range picker to filter time-series data
- Charts update automatically based on your selections

## Example: Using analytics_demo Database

If you have the `analytics_demo` database running:

1. **Connection Details**:
   - Host: `localhost`
   - Port: `5433`
   - Database: `analytics_demo`
   - User: `postgres`
   - Password: `postgres`

2. **Try These Tables**:
   - **orders**: View order trends over time
   - **users**: See user distribution by country
   - **products**: View product categories
   - **order_items**: Analyze order item quantities
   - **payments**: Track payment trends

## API Endpoints

All endpoints require authentication and are available at `/api/v1/analytics/`:

### POST `/api/v1/analytics/schema`
Get database schema (tables and columns)

**Request Body**:
```json
{
  "host": "localhost",
  "port": 5433,
  "database": "analytics_demo",
  "user": "postgres",
  "password": "postgres"
}
```

### POST `/api/v1/analytics/metrics`
Get summary metrics for a table

**Request Body**:
```json
{
  "host": "localhost",
  "port": 5433,
  "database": "analytics_demo",
  "user": "postgres",
  "password": "postgres",
  "table": "orders",
  "metricColumn": "amount"
}
```

### POST `/api/v1/analytics/time-series`
Get time-series data

**Request Body**:
```json
{
  "host": "localhost",
  "port": 5433,
  "database": "analytics_demo",
  "user": "postgres",
  "password": "postgres",
  "table": "orders",
  "dateColumn": "order_date",
  "metricColumn": "amount",
  "startDate": "2024-02-01",
  "endDate": "2024-02-20"
}
```

### POST `/api/v1/analytics/distribution`
Get category distribution

**Request Body**:
```json
{
  "host": "localhost",
  "port": 5433,
  "database": "analytics_demo",
  "user": "postgres",
  "password": "postgres",
  "table": "users",
  "categoryColumn": "country",
  "limit": 10
}
```

### POST `/api/v1/analytics/top-n`
Get top N entities

**Request Body**:
```json
{
  "host": "localhost",
  "port": 5433,
  "database": "analytics_demo",
  "user": "postgres",
  "password": "postgres",
  "table": "products",
  "column": "name",
  "metricColumn": "price",
  "limit": 10
}
```

## Security

- All database connections are read-only (SELECT queries only)
- SQL injection protection using proper identifier escaping
- Connection pooling for efficient resource management
- Authentication required for all endpoints

## Technical Details

### Backend
- **Framework**: Express.js with TypeScript
- **Database Client**: `pg` (node-postgres)
- **Connection Management**: Connection pooling for efficiency

### Frontend
- **Framework**: Next.js 14 with React
- **Charts**: Recharts library
- **State Management**: React Query for data fetching
- **UI**: TailwindCSS with custom components

### Column Type Detection

The system automatically detects:
- **Date Columns**: `date`, `timestamp`, `timestamp without time zone`, `timestamp with time zone`
- **Numeric Columns**: `integer`, `bigint`, `smallint`, `decimal`, `numeric`, `real`, `double precision`
- **Text Columns**: `character varying`, `varchar`, `text`, `char`

## Troubleshooting

### Connection Issues
- Verify database is running and accessible
- Check firewall settings
- Verify credentials are correct
- Ensure database exists

### No Data in Charts
- Verify table has data
- Check date range filters
- Ensure selected columns have appropriate data types
- Check browser console for errors

### Performance Issues
- Large tables may take time to query
- Use date range filters to limit data
- Consider adding indexes to frequently queried columns

## Future Enhancements

Potential improvements:
- Custom SQL query builder
- Saved dashboard configurations
- Export charts as images
- Multiple database connections
- Advanced filtering options
- Real-time data updates
