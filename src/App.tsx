import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

// Import our new layout wrapper
import { MainLayout } from "@/components/layout/MainLayout"

// Import our feature components
import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { KanbanBoard } from "./components/kanban/KanbanBoard"
// import { ProjectsView } from "@/components/projects/ProjectsView"

function App() {
  return (
    <Router>
      <Routes>
        {/* 
          The parent route uses MainLayout. 
          Everything nested inside will render where the <Outlet /> is placed in MainLayout.tsx.
        */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Automatically redirect the base URL to the dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Active Feature Modules */}
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="kanban" element={<KanbanBoard />} />
          {/* <Route path="projects" element={<ProjectsView />} /> */}
          
          {/* Catch-all for paths/modules not yet built */}
          <Route path="*" element={
            <div className="h-[500px] rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/30">
              <p className="text-muted-foreground text-sm">
                This module is currently under construction.
              </p>
            </div>
          } />

        </Route>
      </Routes>
    </Router>
  )
}

export default App