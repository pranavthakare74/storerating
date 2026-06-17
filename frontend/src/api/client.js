const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api"

const TOKEN_KEY = "srs_token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/**
 * Thin fetch wrapper that injects the JWT and parses JSON / errors uniformly.
 */
export async function apiRequest(path, { method = "GET", body, params } = {}) {
  let url = `${API_URL}${path}`

  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null),
    ).toString()
    if (qs) url += `?${qs}`
  }

  const headers = { "Content-Type": "application/json" }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = new Error(data.message || "Request failed.")
    error.status = res.status
    error.details = data.errors
    throw error
  }

  return data
}

export const api = {
  get: (path, params) => apiRequest(path, { params }),
  post: (path, body) => apiRequest(path, { method: "POST", body }),
  put: (path, body) => apiRequest(path, { method: "PUT", body }),
}
