import { useEffect, useState, useCallback } from "react"
import { api } from "../../api/client.js"
import StarRating from "../../components/StarRating.jsx"

export default function UserStores() {
  const [stores, setStores] = useState([])
  const [search, setSearch] = useState({ name: "", address: "" })
  const [sortBy, setSortBy] = useState("name")
  const [order, setOrder] = useState("asc")
  const [error, setError] = useState("")
  const [savingId, setSavingId] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await api.get("/user/stores", { ...search, sortBy, order })
      setStores(data)
    } catch (err) {
      setError(err.message)
    }
  }, [search, sortBy, order])

  useEffect(() => {
    load()
  }, [load])

  async function rate(storeId, rating) {
    setSavingId(storeId)
    setError("")
    try {
      await api.post(`/user/stores/${storeId}/rating`, { rating })
      // Optimistically reflect the new personal rating, then refresh averages.
      setStores((prev) => prev.map((s) => (s.id === storeId ? { ...s, myRating: rating } : s)))
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Stores</h1>
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="panel">
        <div className="filters">
          <div className="field">
            <label>Search by name</label>
            <input
              value={search.name}
              onChange={(e) => setSearch((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Search by address</label>
            <input
              value={search.address}
              onChange={(e) => setSearch((s) => ({ ...s, address: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="address">Address</option>
              <option value="rating">Overall rating</option>
            </select>
          </div>
          <div className="field">
            <label>Order</label>
            <select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {stores.length === 0 ? (
        <div className="panel empty">No stores found.</div>
      ) : (
        <div className="store-grid">
          {stores.map((store) => (
            <div className="store-card" key={store.id}>
              <h3>{store.name}</h3>
              <div className="addr">{store.address}</div>

              <div className="rating-line">
                <span>Overall rating</span>
                <strong>
                  {store.overallRating != null
                    ? `${store.overallRating} (${store.ratingCount})`
                    : "No ratings yet"}
                </strong>
              </div>

              <div className="rating-line">
                <span>Your rating</span>
                <span>{store.myRating ? `${store.myRating}/5` : "Not rated"}</span>
              </div>

              <StarRating
                value={store.myRating || 0}
                onChange={(n) => rate(store.id, n)}
              />
              {savingId === store.id && <small>Saving…</small>}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
