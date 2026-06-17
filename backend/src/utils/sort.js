/**
 * Whitelist-based sort builder. Prevents SQL injection on ORDER BY by only
 * allowing known column names and a fixed direction.
 */
export function buildOrderBy(sortBy, order, allowed, fallback) {
  const column = allowed[sortBy] || allowed[fallback]
  const direction = String(order).toLowerCase() === "desc" ? "DESC" : "ASC"
  return `ORDER BY ${column} ${direction}`
}
