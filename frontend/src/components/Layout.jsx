import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

const NAV_BY_ROLE = {
  ADMIN: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/stores", label: "Stores" },
  ],
  USER: [{ to: "/stores", label: "Stores" }],
  OWNER: [{ to: "/owner", label: "Dashboard" }],
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = NAV_BY_ROLE[user?.role] || []

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">Store Rating System</span>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/account/password"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Password
          </NavLink>
          <span className="user-chip">
            {user?.role} · {user?.email}
          </span>
          <button className="btn ghost sm" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  )
}
