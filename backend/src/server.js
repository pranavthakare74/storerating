import app from "./app.js"
import { config } from "./config/index.js"
import { pool } from "./db/pool.js"

async function start() {
  try {
    // Verify the database connection before accepting traffic.
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    console.log("[server] Database connection OK.")

    app.listen(config.port, () => {
      console.log(`[server] API listening on http://localhost:${config.port}`)
    })
  } catch (err) {
    console.error("[server] Failed to start:", err.message)
    console.error("[server] Did you run `npm run db:init` and set up .env?")
    process.exit(1)
  }
}

start()
