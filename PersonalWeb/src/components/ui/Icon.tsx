import type { ReactNode } from 'react'

export type IconName =
  | 'anchor'
  | 'compass'
  | 'sailboat'
  | 'wave'
  | 'sun'
  | 'cloud'
  | 'rain'
  | 'snow'
  | 'star'
  | 'arrow-down'
  | 'arrow-right'
  | 'arrow-left'
  | 'github'
  | 'mail'
  | 'external'
  | 'menu'
  | 'x'
  | 'calendar'
  | 'clock'
  | 'tag'
  | 'folder'
  | 'message'
  | 'home'
  | 'link'
  | 'heart'
  | 'sparkles'
  | 'wheel'
  | 'palette'
  | 'reset'
  | 'user'
  | 'route'
  | 'archive'
  | 'flag'
  | 'volume'
  | 'volume-x'
  | 'play'
  | 'pause'
  | 'music'

const paths: Record<IconName, ReactNode> = {
  anchor: (
    <>
      <circle cx="12" cy="5" r="2.4" />
      <path d="M12 7.4V21" />
      <path d="M5 12.5h14" />
      <path d="M5 12.5a4 4 0 0 0 7 2.6M19 12.5a4 4 0 0 1-7 2.6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.2 8.8-1.8 4.6-4.6 1.8 1.8-4.6z" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </>
  ),
  sailboat: (
    <>
      <path d="M4 16.5h16" />
      <path d="M5.5 16.5 8 9l4 2.2L16 6l3.5 10.5" />
      <path d="M8 9c.6 1.6 1.6 2.6 3.2 3" />
      <path d="M3 19c2 1.2 4 1.2 6 0s4-1.2 6 0 4 1.2 6 0" strokeLinecap="round" />
    </>
  ),
  wave: (
    <path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 4-2 5-1.5M2 18c2.5-3 5-3 7.5 0s5 3 7.5 0 4-2 5-1.5" strokeLinecap="round" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" strokeLinecap="round" />
    </>
  ),
  cloud: <path d="M7 18a4 4 0 0 1-.6-7.95 5.5 5.5 0 0 1 10.7-1.3A4.2 4.2 0 0 1 17.5 18z" />,
  rain: (
    <>
      <path d="M7 14.5a4 4 0 0 1-.6-7.95 5.5 5.5 0 0 1 10.7-1.3A4.2 4.2 0 0 1 17.5 14.5z" />
      <path d="M9.5 17.5v2.5M14 17.5v2.5M11.7 19.5v2.5M16.2 19.5v2.5" strokeLinecap="round" />
    </>
  ),
  snow: (
    <>
      <path d="M7 13.5a4 4 0 0 1-.6-7.95 5.5 5.5 0 0 1 10.7-1.3A4.2 4.2 0 0 1 17.5 13.5z" />
      <path d="m12 15.5 1 1.7M12 15.5l-1 1.7M12 15.5v2M13 17.2l1.7 1M11 17.2l-1.7 1M13 17.2l.3 2M11 17.2l-.3 2" strokeLinecap="round" />
    </>
  ),
  star: <path d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  'arrow-down': <path d="M12 4v16m0 0-6-6m6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />,
  'arrow-right': <path d="M4 12h16m0 0-6-6m6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />,
  'arrow-left': <path d="M20 12H4m0 0 6-6m-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />,
  github: (
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 10.5 13.5" />
      <path d="M19 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />,
  x: <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 10h17M8 2.8V6M16 2.8V6" strokeLinecap="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" strokeLinecap="round" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12.5 12 4a2 2 0 0 1 1.4-.6H20a1 1 0 0 1 1 1v6.6a2 2 0 0 1-.6 1.4l-8.5 8.5a2 2 0 0 1-2.8 0l-5.6-5.6a2 2 0 0 1 0-2.8z" />
      <circle cx="16.5" cy="7.5" r="1.2" />
    </>
  ),
  folder: <path d="M3.5 6.5A2 2 0 0 1 5.5 4.5h4l2 2.4h7a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />,
  message: (
    <>
      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4.5 3.5V6z" />
      <path d="M8.5 10h7M8.5 13h4.5" strokeLinecap="round" />
    </>
  ),
  home: <path d="m4 11 8-7 8 7v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20zM9.5 21v-6h5v6" />,
  link: (
    <>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 13 4.5a4.2 4.2 0 0 1 6 6l-2 2M13 17.5l-2 2a4.2 4.2 0 0 1-6-6l2-2" />
    </>
  ),
  heart: <path d="M12 20.5s-7.5-4.7-9.3-9.4C1.4 7.9 3.6 4.8 6.8 4.6c2-.1 3.8 1 5.2 2.9 1.4-1.9 3.2-3 5.2-2.9 3.2.2 5.4 3.3 4.1 6.5-1.8 4.7-9.3 9.4-9.3 9.4z" />,
  sparkles: (
    <>
      <path d="M12 4.5 13.8 9l4.5 1.8-4.5 1.8L12 17.1l-1.8-4.5-4.5-1.8L10.2 9z" />
      <path d="M19 15.5v3M17.5 17h3" strokeLinecap="round" />
    </>
  ),
  wheel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v3.4M12 17.6V21M3 12h3.4M17.6 12H21M5.6 5.6l2.4 2.4M16 16l2.4 2.4M18.4 5.6 16 8M8 16l-2.4 2.4" strokeLinecap="round" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.6-2.2-.4-1.1.2-2.3 1.4-2.3H17a4 4 0 0 0 4-4c0-5.2-4-9.5-9-9.5z" />
      <circle cx="7.8" cy="11" r="1" fill="currentColor" />
      <circle cx="10.5" cy="7.6" r="1" fill="currentColor" />
      <circle cx="14.8" cy="7.8" r="1" fill="currentColor" />
    </>
  ),
  reset: <path d="M4 10a8 8 0 1 1 2 6M4 10V5m0 5h5" strokeLinecap="round" strokeLinejoin="round" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20.5a7 7 0 0 1 14 0" />
    </>
  ),
  route: <path d="M6 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6 16.5c0-4 4-6.5 9.5-6.5" strokeLinecap="round" />,
  archive: (
    <>
      <path d="M4 7h16M5.5 7h13l-1 12.5a2 2 0 0 1-2 1.5h-7a2 2 0 0 1-2-1.5z" />
      <path d="M9.5 12h5" strokeLinecap="round" />
    </>
  ),
  flag: <path d="M5 21V4m0 1h13l-2.5 4L18 13H5" strokeLinecap="round" strokeLinejoin="round" />,
  volume: (
    <>
      <path d="M4 10v4h3l4 3V7l-4 3z" />
      <path d="M15 9.5a4 4 0 0 1 0 5M17.3 7.2a7.2 7.2 0 0 1 0 9.6" strokeLinecap="round" />
    </>
  ),
  'volume-x': (
    <>
      <path d="M4 10v4h3l4 3V7l-4 3z" />
      <path d="m16 10 4 4M20 10l-4 4" strokeLinecap="round" />
    </>
  ),
  play: <path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none" />,
  pause: <path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" stroke="none" />,
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
}

export function Icon({ name, size = 20, className = '', strokeWidth = 1.8 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
