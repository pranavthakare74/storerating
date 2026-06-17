/**
 * Centralised validation rules taken directly from the challenge spec:
 *  - Name: 20-60 characters
 *  - Address: max 400 characters
 *  - Password: 8-16 chars, at least one uppercase + one special character
 *  - Email: standard email format
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-[\]\\/;'`~+=]).{8,16}$/

export function validateName(name) {
  if (typeof name !== "string" || name.trim().length < 20 || name.trim().length > 60) {
    return "Name must be between 20 and 60 characters."
  }
  return null
}

export function validateEmail(email) {
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return "A valid email address is required."
  }
  return null
}

export function validateAddress(address) {
  if (typeof address !== "string" || address.trim().length === 0) {
    return "Address is required."
  }
  if (address.length > 400) {
    return "Address must be at most 400 characters."
  }
  return null
}

export function validatePassword(password) {
  if (typeof password !== "string" || !PASSWORD_RE.test(password)) {
    return "Password must be 8-16 characters and include at least one uppercase letter and one special character."
  }
  return null
}

export function validateRating(rating) {
  const n = Number(rating)
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return "Rating must be an integer between 1 and 5."
  }
  return null
}

/**
 * Runs a set of field validators and returns an array of error messages.
 * Pass only the fields you want validated.
 */
export function collectErrors(fields) {
  const errors = []
  if ("name" in fields) {
    const e = validateName(fields.name)
    if (e) errors.push(e)
  }
  if ("email" in fields) {
    const e = validateEmail(fields.email)
    if (e) errors.push(e)
  }
  if ("address" in fields) {
    const e = validateAddress(fields.address)
    if (e) errors.push(e)
  }
  if ("password" in fields) {
    const e = validatePassword(fields.password)
    if (e) errors.push(e)
  }
  if ("rating" in fields) {
    const e = validateRating(fields.rating)
    if (e) errors.push(e)
  }
  return errors
}
