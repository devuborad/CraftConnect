import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env.js';

const rootDir = process.cwd();

async function init() {
  try {
    console.log(`Connecting to MySQL at ${ENV.DB_HOST}:${ENV.DB_PORT} as ${ENV.DB_USER}...`);
    const connection = await mysql.createConnection({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      multipleStatements: true,
      connectTimeout: 5000,
    });
    console.log('✅ Connected to MySQL server successfully!');

    console.log('Applying database/schema.sql...');
    const schemaPath = path.resolve(rootDir, 'database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await connection.query(schemaSql);
    console.log('✅ Database craftconnect and tables created successfully!');

    console.log('Applying database/seed.sql...');
    const seedPath = path.resolve(rootDir, 'database/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    await connection.query(seedSql);
    console.log('✅ Seed data populated successfully!');

    await connection.end();
    console.log('🎉 MySQL Database craftconnect is completely ready!');
  } catch (err: any) {
    console.error('❌ Failed to initialize MySQL database:', err.message);
  }
}

init();
