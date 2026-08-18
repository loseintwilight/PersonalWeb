import { useEffect, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/utils/cn'

const TITLE = '扬帆 · 启航'

/** 首屏指南针加载动画：Anime.js 2D 创意动画 */
export function CompassLoader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const needle = root.querySelector('.cl-needle')
    const wheel = root.querySelector('.cl-wheel')
    const letters = root.querySelectorAll<HTMLElement>('.cl-letter')
    const doneTimer = setTimeout(() => {
      setGone(true)
      setTimeout(onDone, 650)
    }, reduced ? 250 : 1750)

    if (reduced) {
      letters.forEach((l) => {
        l.style.opacity = '1'
        l.style.transform = 'none'
      })
      return () => clearTimeout(doneTimer)
    }

    const anims: ReturnType<typeof animate>[] = []
    if (needle) {
      anims.push(animate(needle, { rotate: [0, 360], duration: 1500, ease: 'inOutQuart', loop: true }))
    }
    if (wheel) {
      anims.push(animate(wheel, { rotate: [0, -360], duration: 2600, ease: 'linear', loop: true }))
    }
    anims.push(
      animate(letters, {
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 480,
        delay: stagger(70, { start: 200 }),
        ease: 'outQuad',
      }),
    )
    return () => {
      clearTimeout(doneTimer)
      anims.forEach((a) => a.cancel())
    }
  }, [reduced, onDone])

  return (
    <div
      ref={rootRef}
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 backdrop-sky transition-all duration-700',
        gone && 'opacity-0 scale-[1.04] pointer-events-none',
      )}
      aria-hidden="true"
    >
      <div className="relative h-40 w-40">
        {/* 外圈刻度 */}
        <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full text-[var(--accent)]">
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="80"
              y1="8"
              x2="80"
              y2={i % 6 === 0 ? '20' : '14'}
              stroke="currentColor"
              strokeWidth={i % 6 === 0 ? 2.4 : 1.4}
              strokeLinecap="round"
              transform={`rotate(${i * 15} 80 80)`}
              opacity={0.85}
            />
          ))}
        </svg>
        {/* 内圈转轮 */}
        <svg viewBox="0 0 160 160" className="cl-wheel absolute inset-3 h-[88%] w-[88%] text-[var(--ink-3)]" opacity="0.8">
          <circle cx="80" cy="80" r="60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 7" />
          <path d="M80 20v22M80 118v22M20 80h22M118 80h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* 指针 */}
        <svg viewBox="0 0 160 160" className="cl-needle absolute inset-0 h-full w-full">
          <path d="M80 30 L92 88 L80 80 L68 88 Z" fill="var(--accent)" />
          <circle cx="80" cy="88" r="5" fill="var(--ink)" />
        </svg>
      </div>
      <p className="font-display text-2xl md:text-3xl tracking-[0.3em] text-[var(--ink)]">
        {Array.from(TITLE).map((ch, i) => (
          <span key={i} className="cl-letter inline-block opacity-0">
            {ch}
          </span>
        ))}
      </p>
      <p className="text-xs tracking-[0.4em] text-[var(--ink-3)]">SETTING SAIL</p>
    </div>
  )
}