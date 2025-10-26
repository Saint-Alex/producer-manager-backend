import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { getDatabaseConfig } from '../shared/config/database.config';

config();

const dbConfig = getDatabaseConfig();

// Determina se estamos em produção ou desenvolvimento
const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
  entities: isProduction
    ? ['dist/database/entities/*.entity.js']
    : ['src/database/entities/*.entity.ts'],
  migrations: isProduction ? ['dist/database/migrations/*.js'] : ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
