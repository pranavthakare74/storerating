import { useEffect, useState, useCallback } from "react"
import { api } from "../../api/client.js"
import DataTable from "../../components/DataTable.jsx"
import { useSort } from "../../hooks/useSort.js"
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from "../../utils/validators.js"

const EMPTY_FORM = { name: "", email: "", address: "", password: "", role: "USER" }

export default function AdminUsers() {
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ name: "", email: "", address: "", role: "" })
  const { sort, onSort } = useSort("name", "asc")
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [formMsg, setFormMsg] = useState("")
  const [detail, setDetail] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await api.get("/admin/users", { ...filters, ...sort })
      setRows(data)
    } catch (err) {
      setError(err.message)
    }
  }, [filters, sort])

  useEffect(() => {
    load()
  }, [load])

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validateForm() {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    }
    setFormErrors(next)
    return Object.values(next).every((v) => !v)
  }

  async function submitForm(e) {
    e.preventDefault()
    setFormMsg("")
    if (!validateForm()) return
    try {
      await api.post("/admin/users", form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      setFormErrors({})
      load()
    } catch (err) {
      setFormMsg(err.message)
    }
  }

  async function openDetail(id) {
    try {
      const data = await api.get(`/admin/users/${id}`)
      setDetail(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (r) => <span className={`badge role-${r.role}`}>{r.role}</span>,
    },
    {
      key: "ownerRating",
      label: "Rating",
      render: (r) => (r.role === "OWNER" ? (r.ownerRating ?? "No ratings") : "—"),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <button className="btn ghost sm" onClick={() => openDetail(r.id)}>
          View
        </button>
      ),
    },
  ]

  return (
    <>
      <div className="page-head">
        <h1>Users</h1>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Close" : "Add user"}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <div className="panel">
          <h2>Add a new user</h2>
          {formMsg && <div className="alert error">{formMsg}</div>}
          <form onSubmit={submitForm} noValidate>
            <div className="filters">
              <div className="field">
                <label>Name</label>
                <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
                {formErrors.name && <div className="hint">{formErrors.name}</div>}
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                />
                {formErrors.email && <div className="hint">{formErrors.email}</div>}
              </div>
              <div className="field">
                <label>Address</label>
                <input value={form.address} onChange={(e) => updateForm("address", e.target.value)} />
                {formErrors.address && <div className="hint">{formErrors.address}</div>}
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                />
                {formErrors.password && <div className="hint">{formErrors.password}</div>}
              </div>
              <div className="field">
                <label>Role</label>
                <select value={form.role} onChange={(e) => updateForm("role", e.target.value)}>
                  <option value="USER">Normal User</option>
                  <option value="OWNER">Store Owner</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>
            <button className="btn" type="submit">
              Create user
            </button>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="filters" style={{ marginBottom: "1rem" }}>
          <div className="field">
            <label>Filter by name</label>
            <input value={filters.name} onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="field">
            <label>Filter by email</label>
            <input value={filters.email} onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="field">
            <label>Filter by address</label>
            <input
              value={filters.address}
              onChange={(e) => setFilters((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Filter by role</label>
            <select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}>
              <option value="">All roles</option>
              <option value="USER">Normal User</option>
              <option value="OWNER">Store Owner</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
        </div>

        <DataTable columns={columns} rows={rows} sort={sort} onSort={onSort} />
      </div>

      {detail && (
        <div className="panel">
          <div className="page-head">
            <h2>User details</h2>
            <button className="btn ghost sm" onClick={() => setDetail(null)}>
              Close
            </button>
          </div>
          <p>
            <strong>Name:</strong> {detail.name}
          </p>
          <p>
            <strong>Email:</strong> {detail.email}
          </p>
          <p>
            <strong>Address:</strong> {detail.address}
          </p>
          <p>
            <strong>Role:</strong> <span className={`badge role-${detail.role}`}>{detail.role}</span>
          </p>
          {detail.role === "OWNER" && (
            <p>
              <strong>Store rating:</strong> {detail.ownerRating ?? "No ratings yet"}
            </p>
          )}
        </div>
      )}
    </>
  )
}
