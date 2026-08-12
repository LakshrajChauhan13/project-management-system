import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  theme: 'light' | 'dark' | 'system'
  language: string
  emailNotifications: boolean
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setLanguage: (lang: string) => void
  setEmailNotifications: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'English',
      emailNotifications: true,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setEmailNotifications: (emailNotifications) => set({ emailNotifications }),
    }),
    {
      name: 'agile-settings-storage',
    }
  )
)