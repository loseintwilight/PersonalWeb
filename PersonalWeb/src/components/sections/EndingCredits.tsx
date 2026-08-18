import { useRef } from 'react'
import { immersiveConfig } from '@/utils/content'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useInView } from '@/hooks/useInView'
import { useScrubMotion, type ScrubState } from '@/hooks/useScrubMotion'
import { easeInOut, mapRange } from '@/utils/scroll'
import { SlowVideo } from '@/components/sections/SlowVideo'
import { cn } from '@/utils/cn'

/**
 * 结束区域：动画片 Ending / 游戏首页结束界面
 * 海底背景缓慢出现、画面渐暗，居中结束字幕如电影片尾一样逐行浮现，保留高级感。
 */
export function EndingCredits() {
  const reduced = usePrefersReducedMotion()
  const isMobile = useIsMobile(820)
  const cfg = immersiveConfig
  const trackRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLDivElement | null>(null)
  const dimRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const textRef = useRef<HTMLParagraphElement | null>(null)
  const ruleRef = useRef<HTMLSpanElement | null>(null)
  const signRef = useRef<HTMLParagraphElement | null>(null)
  const creditsRef = useRef<HTMLParagraphElement | null>(null)
  const { ref: sectionRef, inView } = useInView<HTMLElement>(0.12, '0px 0px -6% 0px')

  const apply = (state: ScrubState): void => {
    const p = state.progress

    if (videoRef.current) {
      videoRef.current.style.transform = `scale(${(1.14 - p * 0.12).toFixed(4)}) translate3d(0, ${(-p * 4).toFixed(2)}%, 0)`
    }
    if (dimRef.current) {
      dimRef.current.style.opacity = String((0.12 + 0.52 * p).toFixed(3))
    }

    if (titleRef.current) {
      const t = easeInOut(mapRange(p, 0.3, 0.5, 0, 1))
      titleRef.current.style.opacity = String(t.toFixed(3))
      titleRef.current.style.transform = `translate3d(0, ${(42 * (1 - t)).toFixed(2)}px, 0)`
    }
    if (textRef.current) {
      const t = easeInOut(mapRange(p, 0.44, 0.64, 0, 1))
      textRef.current.style.opacity = String(t.toFixed(3))
    }
    if (ruleRef.current) {
      ruleRef.current.style.transform = `scaleX(${easeInOut(mapRange(p, 0.5, 0.64, 0, 1)).toFixed(4)})`
    }
    if (signRef.current) {
      const t = easeInOut(mapRange(p, 0.62, 0.78, 0, 1))
      signRef.current.style.opacity = String(t.toFixed(3))
      signRef.current.style.letterSpacing = `${(0.9 - t * 0.55).toFixed(2)}em`
    }
    if (creditsRef.current) {
      creditsRef.current.style.opacity = String(mapRange(p, 0.8, 0.92, 0, 1).toFixed(3))
    }
  }

  useScrubMotion(trackRef, apply, { disabled: reduced || isMobile })


  return (
    <section
      ref={(el) => {
        trackRef.current = el
        sectionRef.current = el
      }}
      className={cn('ending', reduced && 'is-reduced', isMobile && 'is-mobile', inView && 'is-in')}
      aria-label="结束语"
    >
      <div className="ending__stage">
        {/* 海底背景（放慢 4 倍）+ 渐暗 */}
        <div ref={videoRef} className="ending__video">
          <SlowVideo src={cfg.ending.video} poster={cfg.ending.poster} className="ending__video-el" />
        </div>
        <div ref={dimRef} className="ending__dim" aria-hidden="true" />
        <div className="ending__grad" aria-hidden="true" />

        {/* 结束字幕（居中，电影片尾式淡入） */}
        <div className="ending__content">
          <h2 ref={titleRef} className="ending__title">{cfg.ending.title}</h2>
          <span ref={ruleRef} className="ending__rule" aria-hidden="true" />
          <p ref={textRef} className="ending__text">{cfg.ending.text}</p>
          <p ref={signRef} className="ending__sign">{cfg.ending.sign}</p>
          <p ref={creditsRef} className="ending__credits">© 2026 Loseintwilight · 启航 · 用心记录每一次出发</p>
        </div>
      </div>
    </section>
  )
}
