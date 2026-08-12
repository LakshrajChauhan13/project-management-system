import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { KanbanBoard } from "./components/kanban/KanbanBoard"
import { AIStoryGenerator } from "./components/ai/AiStoryGenerator"
import { AISprintPlanner } from "./components/ai/AiSprintPlanner"
import { BacklogView } from "./components/kanban/BacklogView"
import { SettingsView } from "./components/settings/SettingsView"
import { ProjectListView } from "./components/projects/ProjectListView"
import { useThemeManager } from "./hooks/useThemeManager"


function App() {
  useThemeManager()
  
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
          <Route path="settings" element={<SettingsView />} />
          <Route path="projects" element={<ProjectListView />} />

          <Route path="projects/:projectId/kanban" element={<KanbanBoard />} />
          <Route path="projects/:projectId/backlog" element={<BacklogView />} />
          <Route path="projects/:projectId/calendar" element={<div className="p-8">Calendar View Coming Soon</div>} />

          <Route path="ai-story" element={<AIStoryGenerator />} />
          <Route path="ai-sprint-planner" element={<AISprintPlanner />} />

          <Route path="*" element={
            <div className="h-125 rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/30">
              <p className="text-muted-foreground text-lg">
                Page Not Found
              </p>
            </div>
          } />

        </Route>
      </Routes>
    </Router>
  )
}

export default App