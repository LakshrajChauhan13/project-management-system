import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were 
    // trying to go to so we can drop them there after they log in!
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If authenticated, render the child routes (like MainLayout, KanbanBoard, etc.)
  return <Outlet />
}