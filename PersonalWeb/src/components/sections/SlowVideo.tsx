import { useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface SlowVideoProps {
  src: string
  poster: string
  rate?: number
  className?: string
  ariaHidden?: boolean
}

/**
 * 慢速循环背景视频：默认 0.25 倍速（放慢 4 倍）；
 * 离开视口自动暂停以节省性能，reduced-motion 时退化为静态海报。
 */
export function SlowVideo({ src, poster, rate = 0.25, className, ariaHidden = true }: SlowVideoProps) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.playbackRate = rate
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            v.play().catch(() => {
              /* 自动播放被浏览器阻止时静默 */
            })
          } else if (v.readyState >= 2) {
            // 已有可播放数据时才暂停，避免打断初始缓冲
            v.pause()
          }
        }
      },
      { threshold: 0.01 },
    )
    observer.observe(v)
    return () => observer.disconnect()
  }, [rate])

  if (reduced) {
    return <div className={cn(className, 'slow-video-poster')} style={{ backgroundImage: `url(${poster})` }} aria-hidden={ariaHidden} />
  }
  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden={ariaHidden}
    />
  )
}
