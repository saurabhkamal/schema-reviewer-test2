# Backend Setup Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the backend directory with:
   ```env
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   DATABASE_URL=postgresql://user:password@localhost:5432/schema_intelligence
   JWT_SECRET=your-secret-key-change-in-production-min-32-chars
   JWT_EXPIRES_IN=7d
   ```

3. **Create PostgreSQL database**:
   ```sql
   CREATE DATABASE schema_intelligence;
   ```

4. **Generate Prisma client**:
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**:
   ```bash
   npm run prisma:migrate
   ```
   
   When prompted, name the migration: `init`

6. **Start the server**:
   ```bash
   npm run dev
   ```

## Creating Initial Admin User

After the database is set up, you can create an admin user via API:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "password": "securepassword123",
    "role": "ADMIN"
  }'
```

Or use Prisma Studio to insert directly:
```bash
npm run prisma:studio
```

## Testing the API

1. **Health check**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Register a user**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
   ```

3. **Login**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

4. **Use the token** for authenticated requests:
   ```bash
   curl http://localhost:3001/api/v1/schema \
     -H "Authorization: Bearer <your-token>"
   ```

## Database Migrations

To create a new migration:
```bash
npm run prisma:migrate
```

To apply migrations in production:
```bash
npx prisma migrate deploy
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`
- Ensure database exists

### Prisma Client Issues
- Run `npm run prisma:generate` after schema changes
- Delete `node_modules/.prisma` and regenerate if needed

### Port Already in Use
- Change PORT in `.env` file
- Or kill the process using port 3001

