/**
 * Wraps async route handlers so thrown errors flow to the error middleware.
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * 404 handler for unmatched routes.
 */
export function notFound(req, res) {
  res.status(404).json({ message: "Route not found." })
}

/**
 * Central error handler. Returns clean JSON and avoids leaking stack traces.
 */
export function errorHandler(err, req, res, _next) {
  console.error("[error]", err.message)

  // Duplicate key (e.g. email already used)
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "A record with that value already exists (duplicate email)." })
  }

  const status = err.status || 500
  res.status(status).json({ message: err.message || "Internal server error." })
}
