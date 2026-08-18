import { useEffect, useState } from 'react'

export function usePrefersReducedMotion(): boolean {
  // 首帧同步读取 matchMedia，避免「先启用滚动动画、再降级」导致残留内联样式
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}