import { query } from "../db/pool.js"
import { asyncHandler } from "../middleware/error.js"
import { buildOrderBy } from "../utils/sort.js"

/**
 * GET /api/owner/dashboard
 * Average rating across all stores owned by the logged-in OWNER,
 * plus the list of raters. Supports sorting on the raters list.
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const { sortBy = "name", order = "asc" } = req.query

  const stores = await query(
    `SELECT s.id, s.name, s.address,
            ROUND(AVG(r.rating), 2) AS averageRating,
            COUNT(r.id) AS ratingCount
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = ?
     GROUP BY s.id`,
    [req.user.id],
  )

  // Overall average across all of this owner's stores.
  const [overall] = await query(
    `SELECT ROUND(AVG(r.rating), 2) AS averageRating, COUNT(r.id) AS ratingCount
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     WHERE s.owner_id = ?`,
    [req.user.id],
  )

  const orderClause = buildOrderBy(
    sortBy,
    order,
    { name: "u.name", email: "u.email", rating: "r.rating", store: "s.name" },
    "name",
  )

  const raters = await query(
    `SELECT u.id, u.name, u.email, r.rating, s.name AS storeName, r.updated_at AS ratedAt
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     JOIN stores s ON s.id = r.store_id
     WHERE s.owner_id = ?
     ${orderClause}`,
    [req.user.id],
  )

  res.json({
    stores,
    averageRating: overall.averageRating,
    ratingCount: overall.ratingCount,
    raters,
  })
})
