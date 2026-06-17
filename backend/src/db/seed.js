import { pool, query } from "./pool.js"
import { hashPassword } from "../utils/auth.js"

/**
 * Seeds a default admin, an owner, a normal user, a store, and a sample rating.
 * Run with:  npm run db:seed
 *
 * Default credentials (change in production):
 *   Admin  -> admin@store-rating.com  / Admin@1234
 *   Owner  -> owner@store-rating.com  / Owner@1234
 *   User   -> user@store-rating.com   / User@1234
 */
async function seed() {
  console.log("[db:seed] Seeding data...")

  const adminPass = await hashPassword("Admin@1234")
  const ownerPass = await hashPassword("Owner@1234")
  const userPass = await hashPassword("User@1234")

  await query(
    `INSERT IGNORE INTO users (name, email, password, address, role) VALUES
       (?, ?, ?, ?, 'ADMIN'),
       (?, ?, ?, ?, 'OWNER'),
       (?, ?, ?, ?, 'USER')`,
    [
      "System Administrator Account", "admin@store-rating.com", adminPass, "1 Admin Plaza, Control City",
      "Default Store Owner Account", "owner@store-rating.com", ownerPass, "22 Market Street, Commerce Town",
      "Regular Platform User Account", "user@store-rating.com", userPass, "8 Resident Lane, Userville",
    ],
  )

  const [owner] = await query("SELECT id FROM users WHERE email = ?", ["owner@store-rating.com"])
  const [normalUser] = await query("SELECT id FROM users WHERE email = ?", ["user@store-rating.com"])

  await query(
    `INSERT IGNORE INTO stores (name, email, address, owner_id) VALUES
       (?, ?, ?, ?)`,
    ["The Corner Coffee Roasters Co", "store@store-rating.com", "22 Market Street, Commerce Town", owner.id],
  )

  const [store] = await query("SELECT id FROM stores WHERE email = ?", ["store@store-rating.com"])

  await query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
    [normalUser.id, store.id, 4],
  )

  console.log("[db:seed] Done.")
  console.log("  Admin -> admin@store-rating.com / Admin@1234")
  console.log("  Owner -> owner@store-rating.com / Owner@1234")
  console.log("  User  -> user@store-rating.com  / User@1234")
  await pool.end()
}

seed().catch((err) => {
  console.error("[db:seed] Failed:", err.message)
  process.exit(1)
})
