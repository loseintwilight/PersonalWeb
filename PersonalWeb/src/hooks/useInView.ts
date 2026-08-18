import { useEffect, useRef, useState } from 'react'

/** 进入视口后触发一次，用于非 sticky（移动端 / 降级）入场 */
export function useInView<T extends HTMLElement>(threshold = 0.2, rootMargin = '0px 0px -8% 0px') {
  const ref = useRef<T | null>(null)
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
      { threshold, rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, inView }
}
