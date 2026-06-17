import express from "express"
import cors from "cors"
import { config } from "./config/index.js"
import { notFound, errorHandler } from "./middleware/error.js"

import authRoutes from "./routes/authRoutes.js"
import accountRoutes from "./routes/accountRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import ownerRoutes from "./routes/ownerRoutes.js"

const app = express()

app.use(cors({ origin: config.clientOrigin, credentials: true }))
app.use(express.json())

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }))

// Feature routes
app.use("/api/auth", authRoutes)
app.use("/api/account", accountRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/user", userRoutes)
app.use("/api/owner", ownerRoutes)

// Fallbacks
app.use(notFound)
app.use(errorHandler)

export default app
