import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import mysql from "mysql2/promise"
import { config } from "../config/index.js"

/**
 * Creates the database (if missing) and runs schema.sql.
 * Run with:  npm run db:init
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function init() {
  // Connect WITHOUT a database so we can CREATE DATABASE if needed.
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  })

  console.log(`[db:init] Ensuring database "${config.db.database}" exists...`)
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  )
  await connection.query(`USE \`${config.db.database}\`;`)

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8")
  console.log("[db:init] Running schema.sql...")
  await connection.query(schema)

  console.log("[db:init] Done. Tables are ready.")
  await connection.end()
}

init().catch((err) => {
  console.error("[db:init] Failed:", err.message)
  process.exit(1)
})
