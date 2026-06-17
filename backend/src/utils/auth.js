import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { config } from "../config/index.js"

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash)
}

export function signToken(payload) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn })
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret)
}
