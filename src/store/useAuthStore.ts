import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (userData: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      
      // The login function updates state, and 'persist' automatically saves it to localStorage
      login: (userData) => set({ 
        isAuthenticated: true, 
        user: userData 
      }),
      
      // Logout clears the state and removes it from localStorage
      logout: () => set({ 
        isAuthenticated: false, 
        user: null 
      }),
    }),
    {
      name: 'auth-storage', // The key used in localStorage
      storage: createJSONStorage(() => localStorage), 
    }
  )
)