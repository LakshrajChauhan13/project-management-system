import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: string
  title: string
  status: string
  priority: string
  points: number
  assignee: string
  project?: string
  description?: string
  acceptanceCriteria?: string[]
}

const INITIAL_TASKS: Task[] = [
  { 
    id: "TSK-01", 
    title: "Design database schema", 
    status: "To Do", 
    priority: "High", 
    points: 5, 
    assignee: "LC",
    description: "Create the primary MongoDB schemas for Users, Projects, and Tasks.",
    acceptanceCriteria: [
      "User schema includes role-based access fields",
      "Task schema includes references to Sprint and Project IDs"
    ]
  },
]

interface TaskStore {
  tasks: Task[]
  addTask: (task: Task) => void
  addMultipleTasks: (tasks: Task[]) => void
  updateTaskStatus: (taskId: string, newStatus: string) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  approveSprint: (taskIdsToApprove: string[]) => void
}

// Wrap the store in the 'persist' middleware
export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,
      
      addTask: (task) => 
        set((state) => ({ tasks: [...state.tasks, task] })),

      addMultipleTasks: (newTasks) => 
        set((state) => ({ tasks: [...state.tasks, ...newTasks] })),
        
      updateTaskStatus: (taskId, newStatus) => 
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        })),
        
      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId ? { ...task, ...updates } : task
          )
        })),
        
      approveSprint: (taskIdsToApprove) => 
        set((state) => ({
          tasks: state.tasks.map((task) => 
            taskIdsToApprove.includes(task.id) ? { ...task, status: "To Do" } : task
          )
        })),
    }),
    {
      // This is the key that will be used in your browser's localStorage
      name: 'agile-task-storage',
    }
  )
)