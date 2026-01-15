import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  geminiApiKey?: string;
  geminiModel: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined && defaultValue === undefined) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  // Return the value if it exists (even if empty string), otherwise return default
  return value !== undefined ? value : (defaultValue || '');
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = getEnvVar(key, defaultValue?.toString());
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
}

export const env: EnvConfig = {
  port: getEnvNumber('PORT', 3001),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  databaseUrl: getEnvVar('DATABASE_URL', 'postgresql://user:password@localhost:5432/schema_intelligence'),
  jwtSecret: getEnvVar('JWT_SECRET', 'your-secret-key-change-in-production'),
  jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '7d'),
  geminiApiKey: getEnvVar('GEMINI_API_KEY', ''),
  geminiModel: getEnvVar('GEMINI_MODEL', 'gemini-2.5-flash'),
};

