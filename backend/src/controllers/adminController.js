import { query } from "../db/pool.js"
import { asyncHandler } from "../middleware/error.js"
import { hashPassword } from "../utils/auth.js"
import { collectErrors } from "../utils/validators.js"
import { buildOrderBy } from "../utils/sort.js"

/**
 * GET /api/admin/dashboard
 * Totals for users, stores and ratings.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const [users] = await query("SELECT COUNT(*) AS total FROM users")
  const [stores] = await query("SELECT COUNT(*) AS total FROM stores")
  const [ratings] = await query("SELECT COUNT(*) AS total FROM ratings")

  res.json({
    totalUsers: users.total,
    totalStores: stores.total,
    totalRatings: ratings.total,
  })
})

/**
 * POST /api/admin/users
 * Admin creates a USER, ADMIN, or OWNER account.
 */
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, address, password, role } = req.body

  const errors = collectErrors({ name, email, address, password })
  if (errors.length) return res.status(400).json({ message: errors[0], errors })

  const allowedRoles = ["ADMIN", "USER", "OWNER"]
  const finalRole = allowedRoles.includes(role) ? role : "USER"

  const hashed = await hashPassword(password)
  const result = await query(
    "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
    [name.trim(), email.toLowerCase().trim(), hashed, address.trim(), finalRole],
  )

  res.status(201).json({
    id: result.insertId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    address: address.trim(),
    role: finalRole,
  })
})

/**
 * GET /api/admin/users
 * Filters: name, email, address, role. Sorting on name/email/address/role.
 * Includes the store rating when the user is an OWNER.
 */
export const listUsers = asyncHandler(async (req, res) => {
  const { name = "", email = "", address = "", role = "", sortBy = "name", order = "asc" } = req.query

  const where = []
  const params = []
  if (name) {
    where.push("u.name LIKE ?")
    params.push(`%${name}%`)
  }
  if (email) {
    where.push("u.email LIKE ?")
    params.push(`%${email}%`)
  }
  if (address) {
    where.push("u.address LIKE ?")
    params.push(`%${address}%`)
  }
  if (role) {
    where.push("u.role = ?")
    params.push(role)
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : ""

  const orderClause = buildOrderBy(
    sortBy,
    order,
    { name: "u.name", email: "u.email", address: "u.address", role: "u.role" },
    "name",
  )

  const rows = await query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            ROUND(AVG(r.rating), 2) AS ownerRating
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY u.id
     ${orderClause}`,
    params,
  )

  res.json(rows)
})

/**
 * GET /api/admin/users/:id
 * Full detail of a single user (with rating if Store Owner).
 */
export const getUser = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT u.id, u.name, u.email, u.address, u.role,
            ROUND(AVG(r.rating), 2) AS ownerRating
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE u.id = ?
     GROUP BY u.id`,
    [req.params.id],
  )
  if (rows.length === 0) return res.status(404).json({ message: "User not found." })
  res.json(rows[0])
})

/**
 * POST /api/admin/stores
 * Admin adds a store, optionally assigning an OWNER user.
 */
export const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId } = req.body

  const errors = collectErrors({ name, email, address })
  if (errors.length) return res.status(400).json({ message: errors[0], errors })

  let finalOwnerId = null
  if (ownerId) {
    const owner = await query("SELECT id, role FROM users WHERE id = ?", [ownerId])
    if (owner.length === 0) return res.status(400).json({ message: "Selected owner does not exist." })
    if (owner[0].role !== "OWNER") {
      return res.status(400).json({ message: "Assigned owner must have the OWNER role." })
    }
    finalOwnerId = ownerId
  }

  const result = await query(
    "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
    [name.trim(), email.toLowerCase().trim(), address.trim(), finalOwnerId],
  )

  res.status(201).json({
    id: result.insertId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    address: address.trim(),
    ownerId: finalOwnerId,
  })
})

/**
 * GET /api/admin/stores
 * Listing with Name, Email, Address, Rating + filters + sorting.
 */
export const listStores = asyncHandler(async (req, res) => {
  const { name = "", email = "", address = "", sortBy = "name", order = "asc" } = req.query

  const where = []
  const params = []
  if (name) {
    where.push("s.name LIKE ?")
    params.push(`%${name}%`)
  }
  if (email) {
    where.push("s.email LIKE ?")
    params.push(`%${email}%`)
  }
  if (address) {
    where.push("s.address LIKE ?")
    params.push(`%${address}%`)
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : ""

  const orderClause = buildOrderBy(
    sortBy,
    order,
    { name: "s.name", email: "s.email", address: "s.address", rating: "rating" },
    "name",
  )

  const rows = await query(
    `SELECT s.id, s.name, s.email, s.address,
            ROUND(AVG(r.rating), 2) AS rating,
            COUNT(r.id) AS ratingCount,
            o.name AS ownerName
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     LEFT JOIN users o ON o.id = s.owner_id
     ${whereClause}
     GROUP BY s.id
     ${orderClause}`,
    params,
  )

  res.json(rows)
})

/**
 * GET /api/admin/owners
 * Helper list of OWNER users to populate the "assign owner" dropdown.
 */
export const listOwners = asyncHandler(async (req, res) => {
  const rows = await query(
    "SELECT id, name, email FROM users WHERE role = 'OWNER' ORDER BY name ASC",
  )
  res.json(rows)
})
