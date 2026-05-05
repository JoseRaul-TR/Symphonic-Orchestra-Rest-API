// src/config/db.js
import "dotenv/config";
import mysql from "mysql2/promise";

// Connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST!, // The ! indicates to TS that we're sure that exists
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
});

// Help functions to not repeat [rows] in every model
export const query = async <T = any>(sql: string, params: any[] = []): Promise<T> => {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
};

// Test connection
export const testConnection = async (): Promise<void> => {
  const conn = await pool.getConnection();
  console.log("Connecting to MySQL database.\n")
  conn.release();
};
