import { query } from "../db/pool.js"
import { asyncHandler } from "../middleware/error.js"
import { hashPassword, comparePassword } from "../utils/auth.js"
import { validatePassword } from "../utils/validators.js"

/**
 * PUT /api/account/password
 * Available to every authenticated role (Admin / User / Owner).
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required." })
  }

  const passwordError = validatePassword(newPassword)
  if (passwordError) return res.status(400).json({ message: passwordError })

  const rows = await query("SELECT password FROM users WHERE id = ?", [req.user.id])
  const ok = await comparePassword(currentPassword, rows[0].password)
  if (!ok) {
    return res.status(400).json({ message: "Your current password is incorrect." })
  }

  const hashed = await hashPassword(newPassword)
  await query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id])

  res.json({ message: "Password updated successfully." })
})
