export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type Weather = 'sunny' | 'cloudy' | 'rain' | 'snow'

export interface SeasonMeta {
  id: Season
  label: string
  emoji: string
  hint: string
}

export interface WeatherMeta {
  id: Weather
  label: string
  emoji: string
}

export const seasons: SeasonMeta[] = [
  { id: 'spring', label: '春', emoji: '🌸', hint: '浅绿 · 暖阳 · 樱粉' },
  { id: 'summer', label: '夏', emoji: '☀️', hint: '湛蓝 · 烈日 · 浪花' },
  { id: 'autumn', label: '秋', emoji: '🍂', hint: '金黄 · 晚霞 · 静海' },
  { id: 'winter', label: '冬', emoji: '❄️', hint: '雪白 · 星空 · 极光' },
]

export const weathers: WeatherMeta[] = [
  { id: 'sunny', label: '晴天', emoji: '☀️' },
  { id: 'cloudy', label: '多云', emoji: '☁️' },
  { id: 'rain', label: '下雨', emoji: '🌧️' },
  { id: 'snow', label: '下雪', emoji: '🌨️' },
]

export interface ThemeChoice {
  season: Season
  weather: Weather
}

/** 页面默认主题映射（PRD §3.8） */
export const pageDefaultThemes: Record<string, ThemeChoice> = {
  '/': { season: 'spring', weather: 'sunny' },
  '/log': { season: 'summer', weather: 'sunny' },
  '/chart': { season: 'autumn', weather: 'cloudy' },
  '/wake': { season: 'autumn', weather: 'cloudy' },
  '/about': { season: 'spring', weather: 'sunny' },
  '/bottle': { season: 'winter', weather: 'rain' },
}

export function defaultThemeForPath(pathname: string): ThemeChoice {
  if (pathname.startsWith('/log/archive')) return { season: 'winter', weather: 'snow' }
  if (pathname.startsWith('/log')) return { season: 'summer', weather: 'sunny' }
  if (pathname.startsWith('/about')) return { season: 'spring', weather: 'sunny' }
  for (const [prefix, theme] of Object.entries(pageDefaultThemes)) {
    if (pathname === prefix) return theme
  }
  return { season: 'spring', weather: 'sunny' }
}

export const THEME_STORAGE_KEY = 'harbor.theme.v1'