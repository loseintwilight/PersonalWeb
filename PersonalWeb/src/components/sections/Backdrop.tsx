import { useMemo } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Sailboat } from '@/components/animation/Sailboat'
import { Icon } from '@/components/ui/Icon'

interface CloudSpec {
  top: string
  scale: number
  duration: number
  delay: number
  opacity: number
}

const CLOUDS: CloudSpec[] = [
  { top: '6%', scale: 1.15, duration: 68, delay: -10, opacity: 0.95 },
  { top: '14%', scale: 0.75, duration: 52, delay: -32, opacity: 0.8 },
  { top: '24%', scale: 1.5, duration: 84, delay: -55, opacity: 0.85 },
  { top: '32%', scale: 0.55, duration: 44, delay: -18, opacity: 0.7 },
  { top: '40%', scale: 0.95, duration: 60, delay: -70, opacity: 0.9 },
]

const STARS = Array.from({ length: 46 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 42}%`,
  size: 1 + ((i * 7) % 3) * 0.6,
  duration: 2.4 + ((i * 13) % 30) / 10,
  delay: ((i * 17) % 40) / 10,
}))

/** 全站背景层：海天 + 日月 + 云 + 星 + 2D 海洋 + 航行的帆船 + 天气粒子 */
export function Backdrop() {
  const { season } = useTheme()
  const isWinter = season === 'winter'
  const showSun = !isWinter

  const sunStyle = useMemo(() => {
    if (season === 'autumn') return { top: '14%', right: '14%', width: 110, height: 110, opacity: 0.95 }
    if (season === 'summer') return { top: '8%', right: '11%', width: 130, height: 130, opacity: 1 }
    return { top: '10%', right: '13%', width: 110, height: 110, opacity: 0.9 }
  }, [season])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <div className="absolute inset-0 backdrop-sky" />

      {/* 太阳 / 月亮 */}
      {showSun ? (
        <div className="absolute" style={{ top: sunStyle.top, right: sunStyle.right }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full" style={{ background: 'var(--sun-core)', filter: 'blur(38px)', opacity: 0.7, transform: 'scale(1.6)' }} />
            <div className="sun-disc rounded-full relative" style={{ width: sunStyle.width, height: sunStyle.height, opacity: sunStyle.opacity }} />
          </div>
        </div>
      ) : (
        <div className="absolute" style={{ top: '7%', right: '13%' }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(220,235,255,0.35)', filter: 'blur(30px)', transform: 'scale(1.7)' }} />
            <div className="relative h-24 w-24 rounded-full" style={{ background: 'radial-gradient(circle at 38% 36%, #f2f7ff, #c8d9f2 62%, #9db8de)' }}>
              <div className="absolute left-4 top-5 h-4 w-4 rounded-full bg-[#7d97c4] opacity-70" />
              <div className="absolute left-10 top-10 h-6 w-6 rounded-full bg-[#7d97c4] opacity-60" />
              <div className="absolute left-7 top-14 h-3 w-3 rounded-full bg-[#7d97c4] opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* 云 */}
      <div className="absolute inset-0">
        {CLOUDS.map((cloud, i) => (
          <div
            key={i}
            className="cloud"
            style={{
              top: cloud.top,
              left: 0,
              width: 210 * cloud.scale,
              height: 64 * cloud.scale,
              opacity: cloud.opacity,
              animation: `drift ${cloud.duration}s linear infinite`,
              animationDelay: `${cloud.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 星星（冬） */}
      {isWinter && (
        <div className="absolute inset-0">
          {STARS.map((star) => (
            <span
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animation: `twinkle ${star.duration}s ease-in-out infinite`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 海洋层：海浪 + 航行的帆船（2D） */}
      <div className="ocean-layer">
        <div className="ocean-base" />
        <div className="ocean-wave three" />
        <div className="ocean-wave two" />
        <div className="ocean-wave one" />
        {/* 海面微光 */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-transparent to-white/10" />
      </div>

      {/* 航行中的帆船 */}
      <Sailboat className="sea-ship" duration={92} />

      {/* 季节标记 */}
      <div className="absolute bottom-2 left-4 z-[3] hidden items-center gap-2 text-[11px] tracking-widest text-[var(--ink-3)]/70 md:flex">
        <Icon name="sailboat" size={15} />
        <span>SEA {season.toUpperCase()}</span>
      </div>
    </div>
  )
}