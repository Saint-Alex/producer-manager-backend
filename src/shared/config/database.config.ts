export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
}

/**
 * Parse DATABASE_URL format used by Heroku Postgres
 * Format: postgres://username:password@host:port/database
 */
export function parseDatabaseUrl(databaseUrl: string): DatabaseConfig {
  const url = new URL(databaseUrl);

  return {
    host: url.hostname,
    port: parseInt(url.port, 10) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
    ssl: true, // Heroku requires SSL
  };
}

/**
 * Get database configuration from environment variables
 * Supports both individual env vars and DATABASE_URL
 */
export function getDatabaseConfig(): DatabaseConfig {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return parseDatabaseUrl(databaseUrl);
  }

  // Fallback to individual environment variables
  return {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'brainag_user',
    password: process.env.DATABASE_PASSWORD || 'brainag_pass',
    database: process.env.DATABASE_NAME || 'brainag_db',
    ssl: process.env.NODE_ENV === 'production',
  };
}
