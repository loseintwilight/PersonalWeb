import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function CountUp({ value, suffix = '', duration = 1400, className }: { value: number; suffix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced) {
      el.textContent = `${value}${suffix}`
      return
    }
    const proxy = { v: 0 }
    const anim = animate(proxy, {
      v: value,
      duration,
      ease: 'outQuart',
      update: () => {
        el.textContent = `${Math.round(proxy.v)}${suffix}`
      },
    })
    return () => { anim.cancel() }
  }, [value, suffix, duration, reduced])

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}