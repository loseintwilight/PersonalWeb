import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/utils/cn'

interface AmbientParticle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  base: number
  phase: number
  speed: number
  color: string
}

interface OrbSpec {
  size: number
  color: string
  dur: number
  delay: number
  style: Record<string, string>
}

const PARTICLE_COLORS = ['255,255,255', '205,236,255', '186,214,255', '199,184,255']

const ORBS: OrbSpec[] = [
  { size: 46, color: 'var(--accent)', dur: 46, delay: -8, style: { top: '4%', left: '-6%' } },
  { size: 38, color: 'var(--title-c)', dur: 58, delay: -26, style: { top: '30%', left: '60%' } },
  { size: 30, color: 'var(--title-b)', dur: 52, delay: -14, style: { bottom: '2%', left: '20%' } },
  { size: 26, color: 'var(--accent-2)', dur: 42, delay: -32, style: { top: '52%', right: '-5%' } },
]

interface AmbientAuraProps {
  /** 粒子密度系数：默认 1（桌面 60 / 移动 26） */
  density?: number
  /** 是否渲染光晕球（全局层默认渲染，局部场景可关闭） */
  orbs?: boolean
  className?: string
}

/** 全站环境氛围层：缓慢漂移的大面积光晕 + 低速星光粒子（Canvas 2D）。 */
export function AmbientAura({ density = 1, orbs = true, className }: AmbientAuraProps) {
  const reduced = usePrefersReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap || reduced) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const isMobile = window.matchMedia('(max-width: 820px)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6)
    const count = Math.max(8, Math.round((isMobile ? 26 : 60) * density))

    let width = 0
    let height = 0
    let particles: AmbientParticle[] = []
    let raf = 0
    let running = true

    const spawn = (): AmbientParticle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 1.9,
      vx: (Math.random() - 0.5) * 0.07,
      vy: -(0.07 + Math.random() * 0.2),
      base: 0.22 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.006 + Math.random() * 0.018,
      color: PARTICLE_COLORS[(Math.random() * PARTICLE_COLORS.length) | 0],
    })

    const resize = () => {
      width = Math.max(1, wrap.clientWidth)
      height = Math.max(1, wrap.clientHeight)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      particles = Array.from({ length: count }, spawn)
    }

    const tick = () => {
      if (!running) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.phase += p.speed
        if (p.y < -8) {
          p.y = height + 8
          p.x = Math.random() * width
        }
        if (p.x < -8) p.x = width + 8
        if (p.x > width + 8) p.x = -8
        ctx.globalAlpha = p.base * (0.55 + 0.45 * Math.sin(p.phase))
        ctx.fillStyle = `rgba(${p.color},1)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      running = !document.hidden
      if (running && !raf) raf = requestAnimationFrame(tick)
      if (!running && raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    resize()
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced, density])

  return (
    <div ref={wrapRef} className={cn('ambient-aura', className)} aria-hidden="true">
      {orbs &&
        ORBS.map((orb, i) => (
          <span
            key={i}
            className="ambient-orb"
            style={{
              ...orb.style,
              width: `${orb.size}vmin`,
              height: `${orb.size}vmin`,
              ['--orb-color' as string]: orb.color,
              animationDuration: `${orb.dur}s`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}
      <canvas ref={canvasRef} className="ambient-particles" />
    </div>
  )
}