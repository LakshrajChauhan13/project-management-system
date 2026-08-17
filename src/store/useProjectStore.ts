import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Project {
  id: string
  name: string
  description?: string
  status: 'Active' | 'On Hold' | 'Completed' | 'Archived'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
}

interface ProjectStore {
  // State
  projects: Project[]
  currentProjectId: string | null
  
  // Actions
  setCurrentProjectId: (projectId: string | null) => void
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  deleteProject: (projectId: string) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      currentProjectId: null,

      setCurrentProjectId: (projectId) => 
        set({ currentProjectId: projectId }),

      addProject: (project) => 
        set((state) => ({ projects: [...state.projects, project] })),
        
      updateProject: (projectId, updates) =>
        set((state) => ({
          projects: state.projects.map((project) => 
            project.id === projectId ? { ...project, ...updates } : project
          )
        })),

      deleteProject: (projectId) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== projectId),
          currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId
        })),
    }),
    {
      name: 'agile-project-storage',
    }
  )
)