import mysql from "mysql2/promise"
import { config } from "../config/index.js"

/**
 * Shared connection pool. We use a pool (not a single connection) so concurrent
 * requests do not block each other and dropped connections are recovered.
 */
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
})

/**
 * Small helper that returns only the rows from a query.
 * All queries use parameter binding (?) to prevent SQL injection.
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}
