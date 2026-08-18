import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/utils/cn'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  splitBy?: 'words' | 'chars'
}

/** 标题渐显：Anime.js 逐词模糊入场（2D 创意动画层） */
export function AnimatedText({ text, className, delay = 0, splitBy = 'words' }: AnimatedTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const reduced = usePrefersReducedMotion()

  const parts = splitBy === 'chars' ? Array.from(text) : text.split(' ')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = Array.from(el.querySelectorAll<HTMLElement>('.at-unit'))
    if (reduced) {
      targets.forEach((t) => {
        t.style.opacity = '1'
        t.style.transform = 'none'
        t.style.filter = 'none'
      })
      return
    }
    const anim = animate(targets, {
      opacity: [0, 1],
      translateY: [16, 0],
      filter: ['blur(8px)', 'blur(0px)'],
      duration: 850,
      delay: stagger(splitBy === 'chars' ? 26 : 90, { start: delay }),
      ease: 'outExpo',
    })
    return () => { anim.cancel() }
  }, [reduced, delay, splitBy])

  return (
    <span ref={ref} className={cn('inline-flex flex-wrap', className)}>
      {parts.map((part, i) => (
        <span key={i} className="at-unit inline-block opacity-0" style={{ willChange: 'transform, filter, opacity' }}>
          {part}
          {splitBy === 'words' && i < parts.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  )
}