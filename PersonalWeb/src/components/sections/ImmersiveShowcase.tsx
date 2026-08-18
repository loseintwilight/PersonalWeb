import { useEffect, useRef, useState } from 'react'
import { showcaseConfig } from '@/utils/content'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { AmbientAura } from '@/components/animation/AmbientAura'
import { cn } from '@/utils/cn'

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** 卡片视差深度：中间卡「更近」，移动幅度更大，形成空间层次 */
const CARD_DEPTHS = [0.8, 1.15, 0.9]

/**
 * 游戏角色展示（原沉浸式展示区升级）：
 * 滚动进入 → 光束入场 → 三张 16:9 角色卡依次浮现；
 * 持续浮动/呼吸 + 鼠标 3D 视差（背景慢、卡片中、前景快）+ 滚动视差。
 * 内容由 src/content/custom/showcase.json 驱动。
 */
export function ImmersiveShowcase() {
  const reduced = usePrefersReducedMotion()
  const cfg = showcaseConfig

  const trackRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)
  const glowRef = useRef<HTMLDivElement | null>(null)
  const headRef = useRef<HTMLElement | null>(null)
  const headMouseRef = useRef<HTMLDivElement | null>(null)
  const decorRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLSpanElement | null>(null)
  const cardScrollRefs = useRef<(HTMLElement | null)[]>([])
  const cardParallaxRefs = useRef<(HTMLDivElement | null)[]>([])
  const [entered, setEntered] = useState(false)

  /* —— 入场：进入视口后分阶段显现 —— */
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setEntered(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.18 },
    )
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  /* —— 滚动视差 + 进度条 —— */
  useEffect(() => {
    if (reduced) return
    const track = trackRef.current
    const progress = progressRef.current
    if (!track) return

    const isMobile = window.matchMedia('(max-width: 820px)').matches
    const intensity = isMobile ? 0.4 : 1

    let raf = 0
    let current = 0
    let target = 0
    let running = false
    let viewportH = window.innerHeight
    let trackH = track.offsetHeight

    const measure = () => {
      viewportH = window.innerHeight
      trackH = track.offsetHeight
    }

    const apply = (p: number) => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${(-p * 5 * intensity).toFixed(2)}%, 0) scale(${(1.1 - p * 0.08).toFixed(3)})`
      }
      if (headRef.current) {
        headRef.current.style.transform = `translate3d(0, ${(-p * 64 * intensity).toFixed(2)}px, 0)`
        headRef.current.style.opacity = String(Math.max(0, 1 - p * 0.55))
      }
      cardScrollRefs.current.forEach((el) => {
        if (el) el.style.transform = `translate3d(0, ${(-p * 26 * intensity).toFixed(2)}px, 0)`
      })
      if (progress) progress.style.transform = `scaleX(${p.toFixed(4)})`
    }

    const tick = () => {
      const k = 1 - Math.exp(-1 / (60 * 0.12))
      current += (target - current) * k
      if (Math.abs(target - current) < 0.0004) {
        current = target
        running = false
      }
      apply(current)
      raf = running ? requestAnimationFrame(tick) : 0
    }

    const kick = () => {
      if (running) return
      running = true
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      measure()
      const span = Math.max(1, trackH - viewportH)
      target = clamp01(-track.getBoundingClientRect().top / span)
      kick()
    }

    const onResize = () => {
      measure()
      const span = Math.max(1, trackH - viewportH)
      target = clamp01(-track.getBoundingClientRect().top / span)
      current = target
      apply(current)
    }

    measure()
    apply(0)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  /* —— 鼠标 3D 视差（桌面端；背景幅度小、卡片中、前景装饰大） —— */
  useEffect(() => {
    if (reduced) return
    const stage = stageRef.current
    if (!stage) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    let raf = 0
    let tx = 0
    let ty = 0
    let nx = 0
    let ny = 0

    const tick = () => {
      raf = 0
      tx = lerp(tx, nx, 0.07)
      ty = lerp(ty, ny, 0.07)
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${(tx * -9).toFixed(2)}px, ${(ty * -7).toFixed(2)}px, 0)`
      if (headMouseRef.current) headMouseRef.current.style.transform = `translate3d(${(tx * -14).toFixed(2)}px, ${(ty * -10).toFixed(2)}px, 0)`
      cardParallaxRefs.current.forEach((el, i) => {
        if (!el) return
        const depth = CARD_DEPTHS[i % CARD_DEPTHS.length]
        el.style.transform = `translate3d(${(tx * -17 * depth).toFixed(2)}px, ${(ty * -12 * depth).toFixed(2)}px, 0)`
      })
      if (decorRef.current) decorRef.current.style.transform = `translate3d(${(tx * -26).toFixed(2)}px, ${(ty * -20).toFixed(2)}px, 0)`
      if (Math.abs(nx - tx) > 0.0005 || Math.abs(ny - ty) > 0.0005) raf = requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect()
      nx = clamp01((e.clientX - rect.left) / rect.width) * 2 - 1
      ny = clamp01((e.clientY - rect.top) / rect.height) * 2 - 1
      if (!raf) raf = requestAnimationFrame(tick)
    }

    stage.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      stage.removeEventListener('mousemove', onMove)
    }
  }, [reduced])

  return (
    <section
      ref={trackRef}
      className={cn('showcase showcase-track', entered && 'is-in', reduced && 'is-reduced')}
      aria-label={cfg.title}
    >
      <div ref={stageRef} className="showcase-stage">
        {/* 背景：场景虚化 + 暗色罩（滚动视差：慢） */}
        <div ref={bgRef} className="showcase-bg" aria-hidden="true">
          {cfg.bg ? <img src={cfg.bg} alt="" draggable={false} /> : null}
          <div className="showcase-bg__shade" />
        </div>

        {/* 光晕层（鼠标视差：幅度最小） */}
        <div ref={glowRef} className="showcase-glow" aria-hidden="true">
          <span className="showcase-orb o1" />
          <span className="showcase-orb o2" />
          <span className="showcase-orb o3" />
          <span className="showcase-beam" />
        </div>

        {/* 扫描线 + 粒子 */}
        <div className="showcase-scan" aria-hidden="true" />
        <AmbientAura orbs={false} density={0.9} className="showcase-particles" />

        {/* 头部：滚动视差（快）+ 鼠标视差（中） */}
        <header ref={headRef} className="showcase-head">
          <div ref={headMouseRef} className="showcase-head__mouse">
            <div className="showcase-head__entrance">
              <p className="showcase-kicker">
                <span className="showcase-kicker__line" />
                {cfg.kicker}
                <span className="showcase-kicker__line" />
              </p>
              <h2 className="showcase-title">{cfg.title}</h2>
              <p className="showcase-sub">{cfg.subtitle}</p>
              <div className="showcase-head__rule">
                <span />
              </div>
            </div>
          </div>
        </header>

        {/* 角色卡片 */}
        <div className="showcase-row">
          {cfg.items.map((item, i) => (
            <figure
              key={item.code}
              className="char-card"
              ref={(el) => {
                cardScrollRefs.current[i] = el
              }}
            >
              <div className="char-card__stage">
                <div
                  className="char-card__inner"
                  ref={(el) => {
                    cardParallaxRefs.current[i] = el
                  }}
                >
                  <div className="char-card__media">
                    <div className="char-card__bg" aria-hidden="true">
                      <img src={item.image} alt="" draggable={false} loading="lazy" />
                    </div>
                    <img className="char-card__img" src={item.image} alt={item.title} draggable={false} loading="lazy" />
                    <div className="char-card__glow" aria-hidden="true" />
                    <div className="char-card__sweep" aria-hidden="true" />
                    <div className="char-card__edge" aria-hidden="true" />
                    <span className="char-card__code">{item.code}</span>
                    <figcaption className="char-card__cap">
                      <span className="char-card__tag">{item.tags[0]}</span>
                      <h3 className="char-card__name">{item.title}</h3>
                      <p className="char-card__role">{item.subtitle}</p>
                    </figcaption>
                  </div>
                </div>
              </div>
            </figure>
          ))}
        </div>

        {/* HUD 装饰（鼠标视差：幅度最大） */}
        <div ref={decorRef} className="showcase-hud" aria-hidden="true">
          <span className="showcase-hud__corner tl" />
          <span className="showcase-hud__corner tr" />
          <span className="showcase-hud__corner bl" />
          <span className="showcase-hud__corner br" />
          <span className="showcase-hud__tag">
            <i />
            {cfg.hint ?? 'SCROLL'}
          </span>
          <div className="showcase-progress">
            <span ref={progressRef} />
          </div>
        </div>
      </div>
    </section>
  )
}