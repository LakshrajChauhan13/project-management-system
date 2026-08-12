import { useEffect } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'

export function useThemeManager() {
  const theme = useSettingsStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = () => {
      root.classList.remove('light', 'dark')

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }

    // Apply theme immediately
    applyTheme()

    // Listen for dynamic OS color scheme changes if set to 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleSystemChange = () => applyTheme()
      mediaQuery.addEventListener('change', handleSystemChange)
      return () => mediaQuery.removeEventListener('change', handleSystemChange)
    }
  }, [theme])
}