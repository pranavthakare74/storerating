import { useEffect, useState } from "react"
import { api } from "../../api/client.js"

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then(setStats)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <div className="page-head">
        <h1>Admin dashboard</h1>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{stats ? stats.totalUsers : "—"}</div>
          <div className="label">Total users</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats ? stats.totalStores : "—"}</div>
          <div className="label">Total stores</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats ? stats.totalRatings : "—"}</div>
          <div className="label">Total ratings submitted</div>
        </div>
      </div>
    </>
  )
}
