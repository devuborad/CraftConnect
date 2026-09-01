import mysql from 'mysql2/promise';
import { ENV } from './env.js';

export const db = mysql.createPool({
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test database connection helper
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await db.getConnection();
    connection.release();
    return true;
  } catch (error: any) {
    console.warn('⚠️  MySQL Database connection failed:', error.message);
    return false;
  }
}
