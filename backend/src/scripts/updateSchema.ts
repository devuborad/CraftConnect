import mysql from 'mysql2/promise';
import { ENV } from '../config/env.js';

async function updateSchema() {
  try {
    console.log(`Connecting to MySQL database ${ENV.DB_NAME}...`);
    const connection = await mysql.createConnection({
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      user: ENV.DB_USER,
      password: ENV.DB_PASSWORD,
      database: ENV.DB_NAME,
    });

    const [existingCols]: any = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'inquiries'`,
      [ENV.DB_NAME]
    );
    const colNames = existingCols.map((c: any) => c.COLUMN_NAME.toLowerCase());

    const columnsToAdd: { name: string; sql: string }[] = [
      { name: 'type', sql: `ALTER TABLE inquiries ADD COLUMN type ENUM('BULK_INQUIRY', 'DIRECT_ORDER') NOT NULL DEFAULT 'BULK_INQUIRY'` },
      { name: 'is_archived', sql: `ALTER TABLE inquiries ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT FALSE` },
      { name: 'total_amount', sql: `ALTER TABLE inquiries ADD COLUMN total_amount DECIMAL(10, 2) DEFAULT NULL` },
      { name: 'payment_method', sql: `ALTER TABLE inquiries ADD COLUMN payment_method VARCHAR(100) DEFAULT 'Direct Invoice'` },
      { name: 'buyer_name', sql: `ALTER TABLE inquiries ADD COLUMN buyer_name VARCHAR(255) DEFAULT NULL` },
      { name: 'buyer_company', sql: `ALTER TABLE inquiries ADD COLUMN buyer_company VARCHAR(255) DEFAULT NULL` },
      { name: 'buyer_phone', sql: `ALTER TABLE inquiries ADD COLUMN buyer_phone VARCHAR(50) DEFAULT NULL` },
      { name: 'buyer_email', sql: `ALTER TABLE inquiries ADD COLUMN buyer_email VARCHAR(255) DEFAULT NULL` },
      { name: 'completed_at', sql: `ALTER TABLE inquiries ADD COLUMN completed_at DATETIME DEFAULT NULL` },
    ];

    for (const col of columnsToAdd) {
      if (!colNames.includes(col.name.toLowerCase())) {
        console.log(`Adding column ${col.name} to inquiries...`);
        await connection.query(col.sql);
      }
    }

    // Modify status enum
    console.log('Modifying status column on inquiries...');
    await connection.query(
      `ALTER TABLE inquiries MODIFY COLUMN status ENUM('NEW', 'ACCEPTED', 'COUNTERED', 'DECLINED', 'DISPATCHED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NEW'`
    );

    // Modify buyer_id to be nullable for direct customer checkout without account
    console.log('Modifying buyer_id to be nullable...');
    await connection.query(`ALTER TABLE inquiries MODIFY COLUMN buyer_id VARCHAR(36) NULL`);

    console.log('✅ Inquiries table successfully upgraded in MySQL!');
    await connection.end();
  } catch (err: any) {
    console.error('updateSchema error:', err.message);
  }
}

updateSchema();
