# Schema Intelligence Backend

Production-ready backend API for Schema Intelligence platform built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Schema Ingestion**: Accept and store PostgreSQL schema metadata from client-side scanners
- **Versioned Snapshots**: Track schema changes over time with versioned snapshots
- **Issue Detection**: Automatically detect schema issues using deterministic rules (NO AI/ML)
- **Impact Scoring**: Calculate health scores and rank issues by severity
- **SQL Recommendations**: Generate safe SQL recommendations for detected issues (rule-based, NO AI)
- **Schema Comparison**: Compare schemas between snapshots
- **Authentication**: JWT-based authentication with role-based access control
- **Production Ready**: Error handling, validation, logging, and pagination

## Important: How It Works

**This system does NOT connect directly to user databases.** Instead:

1. Users extract schema metadata from their PostgreSQL database using a scanner tool
2. Users upload the schema JSON to the backend via `/api/v1/schema/ingest`
3. Backend stores the schema as a versioned snapshot
4. Backend analyzes the schema using deterministic rules (no AI)
5. Backend generates SQL recommendations based on detected issues

**No API keys needed** - Everything is rule-based and runs on your server.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository** (if not already done)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret key for JWT tokens (min 32 characters)
   - `PORT`: Server port (default: 3001)
   - `CORS_ORIGIN`: Frontend URL (default: http://localhost:3000)

4. **Set up the database**:
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` (or your configured PORT).

## API Endpoints

### Health Check
- `GET /api/health` - Check server and database status

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Schema Management
- `POST /api/v1/schema/ingest` - Ingest schema snapshot (requires auth)
- `GET /api/v1/schema/:dbName` - Get latest snapshot for database
- `GET /api/v1/schema/snapshot/:snapshotId` - Get specific snapshot
- `GET /api/v1/schema?dbName=...&page=1&pageSize=20` - List all snapshots
- `POST /api/v1/schema/compare` - Compare two snapshots

### Impact & Scoring
- `GET /api/v1/impact/score/:snapshotId` - Get health score for snapshot
- `GET /api/v1/impact/rank/:snapshotId?limit=10` - Get ranked issues

### Recommendations
- `POST /api/v1/recommendations/generate/:issueId` - Generate SQL recommendations for issue
- `GET /api/v1/recommendations/issue/:issueId` - Get recommendations for issue
- `GET /api/v1/recommendations/snapshot/:snapshotId` - Get all recommendations for snapshot

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **ADMIN**: Full access to all endpoints
- **DEVELOPER**: Can ingest schemas and view data
- **VIEWER**: Read-only access

## Adding Your Database

### Quick Start

1. **Extract your schema** using the provided script:
   ```bash
   cd backend/scripts
   DB_HOST=localhost DB_PORT=5432 DB_NAME=your_db DB_USER=your_user DB_PASSWORD=your_pass node extract-schema.js
   ```

2. **Upload the schema** via the frontend:
   - Go to `/databases` page
   - Upload the generated `schema.json` file
   - Or paste the JSON directly

3. **View results**:
   - Go to `/schemas` to browse your tables
   - Go to `/issues` to see detected problems
   - Go to `/sql-generator` to get SQL recommendations

### Schema Extraction Script

A ready-to-use script is available at `backend/scripts/extract-schema.js`:

```bash
# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=your_database
export DB_USER=your_username
export DB_PASSWORD=your_password

# Run the script
node backend/scripts/extract-schema.js

# Output will be saved to schema.json
```

## Schema Ingestion Format

When ingesting a schema, send a POST request to `/api/v1/schema/ingest` with the following structure:

```json
{
  "databaseName": "production_db",
  "databaseType": "postgresql",
  "tables": [
    {
      "name": "users",
      "schemaName": "public",
      "rowCount": 10000,
      "sizeBytes": 1048576,
      "sizeFormatted": "1 MB",
      "columns": [
        {
          "name": "id",
          "type": "bigint",
          "nullable": false,
          "defaultValue": null,
          "isPrimaryKey": true,
          "isForeignKey": false
        }
      ],
      "indexes": [
        {
          "name": "idx_users_email",
          "columns": ["email"],
          "unique": true,
          "type": "btree"
        }
      ],
      "foreignKeys": []
    }
  ]
}
```

## Issue Detection Rules

The system automatically detects issues using these **deterministic rules** (NO AI):

1. **Missing index on foreign key** (HIGH severity)
2. **Large table without indexes** (MEDIUM severity)
3. **Too many columns** (LOW severity)
4. **Missing primary key** (CRITICAL severity)
5. **Nullable columns in critical fields** (MEDIUM severity)

## SQL Generator

The SQL Generator **does NOT use AI or API keys**. It works by:

1. Analyzing detected schema issues
2. Applying deterministic rules to generate appropriate SQL
3. Providing safe, reviewable SQL recommendations

**Example Flow:**
- Issue detected: "Missing index on foreign key `orders.user_id`"
- Rule applied: Generate CREATE INDEX statement
- SQL generated: `CREATE INDEX idx_orders_user_id ON public.orders(user_id);`

No external APIs, no AI services, no API keys required.

## Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Prisma Studio (database GUI)
npm run prisma:studio
```

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   ├── database.ts        # Prisma client setup
│   │   └── env.ts             # Environment variables
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── routes/                # API routes
│   ├── middleware/            # Auth, validation, error handling
│   └── utils/                 # Utilities
├── prisma/
│   └── schema.prisma          # Database schema
├── .env.example               # Environment variables template
└── package.json
```

## Database Schema

The Prisma schema includes:

- **User**: Authentication and authorization
- **Database**: Database metadata
- **SchemaSnapshot**: Versioned schema snapshots
- **Table**: Table metadata
- **Column**: Column definitions
- **Index**: Index definitions
- **ForeignKey**: Foreign key constraints
- **Issue**: Detected schema issues
- **SqlRecommendation**: Generated SQL recommendations

## Error Handling

All errors are handled centrally and return consistent JSON responses:

```json
{
  "status": "error",
  "message": "Error message"
}
```

Validation errors include detailed field information:

```json
{
  "status": "fail",
  "message": "Validation error",
  "errors": [...]
}
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET` (min 32 characters)
3. Configure proper `CORS_ORIGIN` for your frontend
4. Use environment-specific `DATABASE_URL`
5. Run migrations: `npm run prisma:migrate deploy`
6. Build: `npm run build`
7. Start: `npm start`

## License

ISC

