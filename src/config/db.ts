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

  // Fix mysql2 type mismatches:
  // tinyint(1) -> boolean (orchestra_member.musicians)
  // decimal(8, 2) -> number (salary_per_day.musicians)
  typeCast(field, next) {
    if (field.type === "TINY" && field.length === 1) {
      const val = field.string();
      return val === null ? null : val === "1";
    }
    if (field.type === "NEWDECIMAL") {
      const val = field.string();
      return val === null ? null : parseFloat(val);
    }
    return next();
  },
});

// Help functions to not repeat [rows] in every model
export const query = async <T = any>(
  sql: string,
  params: any[] = [],
): Promise<T> => {
  const [rows] = await pool.query(sql, params);
  return rows as T;
};

// Test connection
export const testConnection = async (): Promise<void> => {
  const conn = await pool.getConnection();
  console.log("Ansluter till MySQL-databasen.");
  conn.release();
};
