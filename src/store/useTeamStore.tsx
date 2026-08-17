import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'Admin' | 'Product Owner' | 'Scrum Master' | 'Developer' | 'Designer'
export type Availability = 'Available' | 'Busy' | 'In Meeting' | 'On Leave'

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: Role
  availability: Availability
  currentSprint: string
  productivity: number // Percentage (0 - 100)
  tasksAssigned: number
}

interface TeamStore {
  members: TeamMember[]
  addMember: (member: Omit<TeamMember, 'id'>) => void
  removeMember: (id: string) => void
  updateMemberRole: (id: string, role: Role) => void
  updateMemberAvailability: (id: string, availability: Availability) => void
}

const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'MEM-101',
    name: 'Lakshraj Chauhan',
    email: 'lakshraj@sprintai.com',
    avatar: 'LC',
    role: 'Admin',
    availability: 'Available',
    currentSprint: 'Sprint 5: Core Features',
    productivity: 96,
    tasksAssigned: 5,
  },
  {
    id: 'MEM-102',
    name: 'Sarah Jenkins',
    email: 'sarah.j@sprintai.com',
    avatar: 'SJ',
    role: 'Product Owner',
    availability: 'In Meeting',
    currentSprint: 'Sprint 5: Core Features',
    productivity: 88,
    tasksAssigned: 3,
  },
  {
    id: 'MEM-103',
    name: 'Alex Rivera',
    email: 'alex.r@sprintai.com',
    avatar: 'AR',
    role: 'Developer',
    availability: 'Busy',
    currentSprint: 'Sprint 5: Core Features',
    productivity: 92,
    tasksAssigned: 6,
  },
  {
    id: 'MEM-104',
    name: 'Elena Rostova',
    email: 'elena.r@sprintai.com',
    avatar: 'ER',
    role: 'Designer',
    availability: 'On Leave',
    currentSprint: 'Sprint 5: Core Features',
    productivity: 84,
    tasksAssigned: 2,
  },
]

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      members: INITIAL_MEMBERS,

      addMember: (newMember) =>
        set((state: TeamStore) => ({
          members: [
            ...state.members,
            {
              ...newMember,
              id: `MEM-${Math.floor(Math.random() * 900) + 100}`,
            },
          ],
        })),

      removeMember: (id) =>
        set((state: TeamStore) => ({
          members: state.members.filter((m) => m.id !== id),
        })),

      updateMemberRole: (id, role) =>
        set((state: TeamStore) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, role } : m
          ),
        })),

      updateMemberAvailability: (id, availability) =>
        set((state: TeamStore) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, availability } : m
          ),
        })),
    }),
    {
      name: 'agile-team-storage',
    }
  )
)