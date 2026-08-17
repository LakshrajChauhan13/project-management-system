import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useThemeManager } from "@/hooks/useThemeManager"

import { MainLayout } from "@/components/layout/MainLayout"
import { ProjectLayout } from "@/components/layout/ProjectLayout" // NEW IMPORT

import { DashboardOverview } from "@/components/dashboard/DashboardOverview"
import { KanbanBoard } from "@/components/kanban/KanbanBoard"
import { AIStoryGenerator } from "@/components/ai/AiStoryGenerator"
import { AISprintPlanner } from "@/components/ai/AiSprintPlanner"
import { BacklogView } from "@/components/kanban/BacklogView"
import { SettingsView } from "@/components/settings/SettingsView"
import { ProjectListView } from "@/components/projects/ProjectListView"
import { CalendarView } from "./components/calendar/CalendarView"
import { TeamView } from "./components/team/TeamView"

function App() {
  useThemeManager()

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Global Routes */}
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="projects" element={<ProjectListView />} />
          
          {/* Nested Project Context Routes */}
          <Route path="projects/:projectId" element={<ProjectLayout />}>
            {/* Redirect root project ID to Kanban automatically */}
            <Route index element={<Navigate to="kanban" replace />} />
            
            {/* Contextual Tools */}
            <Route path="kanban" element={<KanbanBoard />} />
            <Route path="backlog" element={<BacklogView />} />
            <Route path="ai-sprint-planner" element={<AISprintPlanner />} />
            <Route path="ai-story-generator" element={<AIStoryGenerator />} />
            <Route path="calendar" element={<CalendarView />} />
          </Route>
          
          <Route path="*" element={
            <div className="h-[500px] rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/30">
              <p className="text-muted-foreground text-sm">Module under construction.</p>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  )
}

export default App