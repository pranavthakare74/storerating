import dotenv from "dotenv"

dotenv.config()

export const config = {
  port: Number(process.env.PORT || 4000),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "store_rating",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "change_me_in_production",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
}
