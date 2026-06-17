import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from "../utils/validators.js"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: "", email: "", address: "", password: "" })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")
  const [busy, setBusy] = useState(false)

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validate() {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    }
    setErrors(next)
    return Object.values(next).every((v) => !v)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError("")
    if (!validate()) return
    setBusy(true)
    try {
      await register(form)
      navigate("/stores") // self-signup is always a Normal User
    } catch (err) {
      setServerError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-subtitle">Sign up as a normal user</p>

        {serverError && <div className="alert error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
            <div className="hint">{errors.name || "Between 20 and 60 characters."}</div>
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
            {errors.email && <div className="hint">{errors.email}</div>}
          </div>
          <div className="field">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              rows={2}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
            <div className="hint">{errors.address || "Up to 400 characters."}</div>
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
            <div className="hint">
              {errors.password || "8-16 chars, one uppercase letter and one special character."}
            </div>
          </div>
          <button className="btn block" type="submit" disabled={busy}>
            {busy ? "Creating…" : "Sign up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
