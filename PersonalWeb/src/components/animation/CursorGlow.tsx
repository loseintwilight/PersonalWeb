import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** 光标跟随光晕（DOM 动效层，轻量 rAF） */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    let raf = 0
    let x = window.innerWidth / 2
    let y = window.innerHeight / 3
    let tx = x
    let ty = y

    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
    }
    const tick = () => {
      x += (tx - x) * 0.09
      y += (ty - y) * 0.09
      el.style.transform = `translate3d(${x - 190}px, ${y - 190}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  if (reduced) return null
  return <div ref={ref} className="cursor-glow-dot hidden md:block" aria-hidden="true" />
}