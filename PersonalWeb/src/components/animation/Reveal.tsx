import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  blur?: boolean
  as?: 'div' | 'section' | 'li' | 'span'
  style?: CSSProperties
}

/** 滚动入场：IntersectionObserver + CSS 过渡（DOM 动效层） */
export function Reveal({ children, className, delay = 0, blur = false, as: Tag = 'div', style }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={cn(blur ? 'reveal-blur' : 'reveal', inView && 'reveal-in', className)}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  )
}