import { useEffect, useState, useCallback } from "react"
import { api } from "../../api/client.js"
import DataTable from "../../components/DataTable.jsx"
import { useSort } from "../../hooks/useSort.js"
import { validateName, validateEmail, validateAddress } from "../../utils/validators.js"

const EMPTY_FORM = { name: "", email: "", address: "", ownerId: "" }

export default function AdminStores() {
  const [rows, setRows] = useState([])
  const [owners, setOwners] = useState([])
  const [filters, setFilters] = useState({ name: "", email: "", address: "" })
  const { sort, onSort } = useSort("name", "asc")
  const [error, setError] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [formMsg, setFormMsg] = useState("")

  const load = useCallback(async () => {
    try {
      const data = await api.get("/admin/stores", { ...filters, ...sort })
      setRows(data)
    } catch (err) {
      setError(err.message)
    }
  }, [filters, sort])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    api.get("/admin/owners").then(setOwners).catch(() => {})
  }, [])

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function validateForm() {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
    }
    setFormErrors(next)
    return Object.values(next).every((v) => !v)
  }

  async function submitForm(e) {
    e.preventDefault()
    setFormMsg("")
    if (!validateForm()) return
    try {
      await api.post("/admin/stores", {
        ...form,
        ownerId: form.ownerId || null,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      setFormErrors({})
      load()
    } catch (err) {
      setFormMsg(err.message)
    }
  }

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "address", label: "Address", sortable: true },
    { key: "ownerName", label: "Owner", render: (r) => r.ownerName || "—" },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (r) => (r.rating != null ? `${r.rating} (${r.ratingCount})` : "No ratings"),
    },
  ]

  return (
    <>
      <div className="page-head">
        <h1>Stores</h1>
        <button className="btn" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Close" : "Add store"}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <div className="panel">
          <h2>Add a new store</h2>
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
                <label>Owner (optional)</label>
                <select value={form.ownerId} onChange={(e) => updateForm("ownerId", e.target.value)}>
                  <option value="">No owner</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn" type="submit">
              Create store
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
        </div>

        <DataTable columns={columns} rows={rows} sort={sort} onSort={onSort} />
      </div>
    </>
  )
}
