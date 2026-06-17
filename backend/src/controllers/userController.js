import { query } from "../db/pool.js"
import { asyncHandler } from "../middleware/error.js"
import { validateRating } from "../utils/validators.js"
import { buildOrderBy } from "../utils/sort.js"

/**
 * GET /api/user/stores
 * All stores with overall rating + this user's submitted rating.
 * Supports search by name/address and sorting.
 */
export const listStores = asyncHandler(async (req, res) => {
  const { name = "", address = "", sortBy = "name", order = "asc" } = req.query

  const where = []
  const params = [req.user.id] // first ? is the correlated user rating
  if (name) {
    where.push("s.name LIKE ?")
    params.push(`%${name}%`)
  }
  if (address) {
    where.push("s.address LIKE ?")
    params.push(`%${address}%`)
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : ""

  const orderClause = buildOrderBy(
    sortBy,
    order,
    { name: "s.name", address: "s.address", rating: "overallRating" },
    "name",
  )

  const rows = await query(
    `SELECT s.id, s.name, s.address,
            ROUND(AVG(r.rating), 2) AS overallRating,
            COUNT(r.id) AS ratingCount,
            (SELECT ur.rating FROM ratings ur
               WHERE ur.store_id = s.id AND ur.user_id = ?) AS myRating
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     ${whereClause}
     GROUP BY s.id
     ${orderClause}`,
    params,
  )

  res.json(rows)
})

/**
 * POST /api/user/stores/:storeId/rating
 * Submit or update (upsert) this user's rating for a store.
 */
export const submitRating = asyncHandler(async (req, res) => {
  const { rating } = req.body
  const { storeId } = req.params

  const ratingError = validateRating(rating)
  if (ratingError) return res.status(400).json({ message: ratingError })

  const store = await query("SELECT id FROM stores WHERE id = ?", [storeId])
  if (store.length === 0) return res.status(404).json({ message: "Store not found." })

  // Upsert: insert, or update the existing rating thanks to the UNIQUE(user, store) key.
  await query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
    [req.user.id, storeId, Number(rating)],
  )

  res.status(201).json({ message: "Rating saved.", rating: Number(rating) })
})
