import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"
import Layout from "./Layout.jsx"

/**
 * Guards routes by authentication and (optionally) role.
 */
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="center-screen">Loading…</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    // Send each role to its own home.
    const home = user.role === "ADMIN" ? "/admin" : user.role === "OWNER" ? "/owner" : "/stores"
    return <Navigate to={home} replace />
  }

  return <Layout>{children}</Layout>
}
