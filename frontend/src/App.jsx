import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"

import Login from "./pages/Login"
import Register from "./pages/Register"
import UpdatePassword from "./pages/UpdatePassword"

import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminStores from "./pages/admin/AdminStores"

import UserStores from "./pages/user/UserStores"
import OwnerDashboard from "./pages/owner/OwnerDashboard"

// Sends a logged-in user to the correct landing page for their role.
function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />
  if (user.role === "OWNER") return <Navigate to="/owner" replace />
  return <Navigate to="/stores" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated routes wrapped in the shared layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* System Administrator */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/stores"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <AdminStores />
                </ProtectedRoute>
              }
            />

            {/* Normal User */}
            <Route
              path="/stores"
              element={
                <ProtectedRoute roles={["USER"]}>
                  <UserStores />
                </ProtectedRoute>
              }
            />

            {/* Store Owner */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute roles={["OWNER"]}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared: any authenticated user can change their password */}
            <Route path="/update-password" element={<UpdatePassword />} />
          </Route>

          {/* Default + fallback */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
