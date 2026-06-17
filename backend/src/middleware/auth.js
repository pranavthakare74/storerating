import { verifyToken } from "../utils/auth.js"
import { query } from "../db/pool.js"

/**
 * Verifies the Bearer JWT and attaches the current user to req.user.
 */
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || ""
    const token = header.startsWith("Bearer ") ? header.slice(7) : null
    if (!token) {
      return res.status(401).json({ message: "Authentication required." })
    }

    const decoded = verifyToken(token)
    const rows = await query(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [decoded.id],
    )
    if (rows.length === 0) {
      return res.status(401).json({ message: "User no longer exists." })
    }

    req.user = rows[0]
    next()
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." })
  }
}

/**
 * Restricts a route to one or more roles. Usage: authorize("ADMIN")
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to access this resource." })
    }
    next()
  }
}
