import { Client, Pool } from 'pg';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

/**
 * Create a PostgreSQL connection pool for external databases
 */
export function createDbPool(config: DatabaseConfig): Pool {
  return new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    max: 5, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

/**
 * Create a single-use client for external databases
 */
export function createDbClient(config: DatabaseConfig): Client {
  return new Client({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
  });
}

/**
 * Parse connection string to config
 * Format: postgresql://user:password@host:port/database
 */
export function parseConnectionString(connectionString: string): DatabaseConfig {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432', 10),
      database: url.pathname.slice(1), // Remove leading '/'
      user: url.username,
      password: url.password,
      ssl: url.searchParams.get('ssl') === 'true',
    };
  } catch (error) {
    throw new Error(`Invalid connection string: ${error}`);
  }
}

/**
 * Test database connection
 */
export async function testConnection(config: DatabaseConfig): Promise<boolean> {
  const client = createDbClient(config);
  try {
    await client.connect();
    await client.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  } finally {
    await client.end();
  }
}
