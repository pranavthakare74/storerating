import { query } from "../db/pool.js"
import { asyncHandler } from "../middleware/error.js"
import { hashPassword, comparePassword, signToken } from "../utils/auth.js"
import { collectErrors } from "../utils/validators.js"

/**
 * POST /api/auth/register
 * Public self-signup. Always creates a Normal User (role = USER).
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, address, password } = req.body

  const errors = collectErrors({ name, email, address, password })
  if (errors.length) return res.status(400).json({ message: errors[0], errors })

  const hashed = await hashPassword(password)
  const result = await query(
    "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, 'USER')",
    [name.trim(), email.toLowerCase().trim(), hashed, address.trim()],
  )

  const user = {
    id: result.insertId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    address: address.trim(),
    role: "USER",
  }
  const token = signToken({ id: user.id, role: user.role })
  res.status(201).json({ token, user })
})

/**
 * POST /api/auth/login
 * Single login for all roles. Role is returned so the frontend can route.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." })
  }

  const rows = await query(
    "SELECT id, name, email, password, address, role FROM users WHERE email = ?",
    [email.toLowerCase().trim()],
  )
  if (rows.length === 0) {
    return res.status(401).json({ message: "Invalid email or password." })
  }

  const found = rows[0]
  const ok = await comparePassword(password, found.password)
  if (!ok) {
    return res.status(401).json({ message: "Invalid email or password." })
  }

  const user = {
    id: found.id,
    name: found.name,
    email: found.email,
    address: found.address,
    role: found.role,
  }
  const token = signToken({ id: user.id, role: user.role })
  res.json({ token, user })
})

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (req.user set by middleware).
 */
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user })
})
