import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Sprint {
  id: string
  projectId: string
  name: string
  startDate: string // Stored as an ISO string (e.g., "2026-08-18")
  endDate: string   // Stored as an ISO string (e.g., "2026-09-01")
  status: 'Planned' | 'Active' | 'Completed'
}

interface SprintStore {
  sprints: Sprint[]
  addSprint: (sprint: Sprint) => void
  updateSprint: (sprintId: string, updates: Partial<Sprint>) => void
  deleteSprint: (sprintId: string) => void
}

export const useSprintStore = create<SprintStore>()(
  persist(
    (set) => ({
      sprints: [], // Initializes with an empty array of sprints

      // Adds a newly generated sprint to the store
      addSprint: (sprint) =>
        set((state) => ({ sprints: [...state.sprints, sprint] })),

      // Updates specific fields of an existing sprint (e.g., marking it "Completed")
      updateSprint: (sprintId, updates) =>
        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === sprintId ? { ...sprint, ...updates } : sprint
          ),
        })),

      // Removes a sprint entirely if it is cancelled or deleted
      deleteSprint: (sprintId) =>
        set((state) => ({
          sprints: state.sprints.filter((sprint) => sprint.id !== sprintId),
        })),
    }),
    {
      name: 'agile-sprint-storage', // The key used in localStorage
    }
  )
)