import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultThemeForPath, THEME_STORAGE_KEY, type Season, type ThemeChoice, type Weather } from '@/themes'

interface ThemeContextValue {
  season: Season
  weather: Weather
  isCustom: boolean
  applyPath: (pathname: string) => void
  setSeason: (s: Season) => void
  setWeather: (w: Weather) => void
  reset: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStored(): ThemeChoice | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ThemeChoice
    if (!['spring', 'summer', 'autumn', 'winter'].includes(parsed.season)) return null
    if (!['sunny', 'cloudy', 'rain', 'snow'].includes(parsed.weather)) return null
    return parsed
  } catch {
    return null
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [custom, setCustom] = useState<ThemeChoice | null>(() => readStored())
  const [pathTheme, setPathTheme] = useState<ThemeChoice>(() => defaultThemeForPath(window.location.pathname))

  // 路由变化时更新页面默认主题（由 App 层通知）
  const applyPath = useCallback((pathname: string) => {
    setPathTheme(defaultThemeForPath(pathname))
  }, [])

  const season = custom?.season ?? pathTheme.season
  const weather = custom?.weather ?? pathTheme.weather

  useEffect(() => {
    document.documentElement.dataset.season = season
    document.documentElement.dataset.weather = weather
  }, [season, weather])

  const setSeason = useCallback((s: Season) => {
    setCustom((prev) => {
      const next = { season: s, weather: prev?.weather ?? defaultThemeForPath(window.location.pathname).weather }
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setWeather = useCallback((w: Weather) => {
    setCustom((prev) => {
      const next = { season: prev?.season ?? defaultThemeForPath(window.location.pathname).season, weather: w }
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(THEME_STORAGE_KEY)
    setCustom(null)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ season, weather, isCustom: custom !== null, setSeason, setWeather, reset, applyPath }),
    [season, weather, custom, setSeason, setWeather, reset, applyPath],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme 必须在 ThemeProvider 内使用')
  return ctx
}