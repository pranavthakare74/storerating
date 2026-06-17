import { useEffect, useState, useCallback } from "react"
import { api } from "../../api/client.js"
import DataTable from "../../components/DataTable.jsx"
import { useSort } from "../../hooks/useSort.js"

export default function OwnerDashboard() {
  const [data, setData] = useState(null)
  const { sort, onSort } = useSort("name", "asc")
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    try {
      const res = await api.get("/owner/dashboard", { ...sort })
      setData(res)
    } catch (err) {
      setError(err.message)
    }
  }, [sort])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    { key: "name", label: "User", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "storeName", label: "Store", sortable: true },
    { key: "rating", label: "Rating", sortable: true, render: (r) => `${r.rating}/5` },
    {
      key: "ratedAt",
      label: "Rated on",
      render: (r) => new Date(r.ratedAt).toLocaleDateString(),
    },
  ]

  return (
    <>
      <div className="page-head">
        <h1>Owner dashboard</h1>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">
            {data && data.averageRating != null ? data.averageRating : "—"}
          </div>
          <div className="label">Average rating (all your stores)</div>
        </div>
        <div className="stat-card">
          <div className="value">{data ? data.ratingCount : "—"}</div>
          <div className="label">Total ratings received</div>
        </div>
        <div className="stat-card">
          <div className="value">{data ? data.stores.length : "—"}</div>
          <div className="label">Your stores</div>
        </div>
      </div>

      {data && data.stores.length > 0 && (
        <div className="panel">
          <h2>Your stores</h2>
          <div className="store-grid">
            {data.stores.map((s) => (
              <div className="store-card" key={s.id}>
                <h3>{s.name}</h3>
                <div className="addr">{s.address}</div>
                <div className="rating-line">
                  <span>Average rating</span>
                  <strong>
                    {s.averageRating != null ? `${s.averageRating} (${s.ratingCount})` : "No ratings"}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel">
        <h2>Users who rated your stores</h2>
        <DataTable
          columns={columns}
          rows={data ? data.raters : []}
          sort={sort}
          onSort={onSort}
          emptyText="No ratings have been submitted yet."
        />
      </div>
    </>
  )
}
