import { useEffect, useRef, type CSSProperties } from 'react'
import { immersiveConfig } from '@/utils/content'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useScrubMotion, type ScrubState } from '@/hooks/useScrubMotion'
import { clamp01, easeInOut, easeOutBack, mapRange } from '@/utils/scroll'
import { SlowVideo } from '@/components/sections/SlowVideo'
import { MatrixHolo } from '@/components/sections/MatrixHolo'

import { cn } from '@/utils/cn'

/** 矩阵区域随滚动离场的节奏（末尾淡出交接下一幕） */
const EXIT_START = 0.9
const EXIT_DUR = 0.1
/** 矩阵「聚→散」入场：欢迎文字（0.05–0.18）浮现之后再开始，由内而外弹性散开 */
const MATRIX_ENTR_START = 0.2
const MATRIX_ENTR_SPAN = 0.11
/** 每张卡片散开的进度错开量（按距中心距离排序后由内而外） */
const MATRIX_STAGGER = 0.012

/**
 * 第一下拉模块：入海 · 规整信息矩阵
 * 滚动时以「潜入深海」为叙事：背景视频缓慢缩放视差，标题浮现；
 * 中央为规整三段式信息矩阵（2 / 2 / 3 等宽行列），随下拉滚动：
 * 先浮现欢迎文字（0.05–0.18），再让矩阵由内而外聚→散（0.20 起），末尾整体离场。
 * 卡片悬停高亮，链接直达日志 / 归档 / 项目页。
 */
export function OceanDeck() {
  const reduced = usePrefersReducedMotion()
  const isMobile = useIsMobile(820)
  const cfg = immersiveConfig
  const trackRef = useRef<HTMLElement | null>(null)
  const videoRef = useRef<HTMLDivElement | null>(null)
  const veilRef = useRef<HTMLDivElement | null>(null)
  const headRef = useRef<HTMLElement | null>(null)
  const matrixRef = useRef<HTMLDivElement | null>(null)
  /** 矩阵聚散动画的卡片与偏移缓存（offsetLeft/offsetTop 不受 transform 影响，缩放/滚动后仍有效） */
  const matrixAnimRef = useRef<{ cards: HTMLElement[]; data: Array<{ gx: number; gy: number; gr: number }> } | null>(null)

  const apply = (state: ScrubState): void => {
    const p = state.progress
    if (videoRef.current) {
      // 缓慢放大 + 视差上移：镜头进入场景的空间感
      const scale = 1.04 + p * 0.15
      videoRef.current.style.transform = `translate3d(0, ${(-p * 6).toFixed(2)}%, 0) scale(${scale.toFixed(4)})`
    }
    if (veilRef.current) {
      const dive = 0.45 + 0.5 * easeInOut(mapRange(p, 0.02, 0.13, 0, 1))
      const clear = easeInOut(mapRange(p, 0.46, 0.62, 0, 1))
      veilRef.current.style.opacity = String((dive * 0.9 * (1 - clear)).toFixed(3))
    }
    if (headRef.current) {
      const t = easeInOut(mapRange(p, 0.05, 0.18, 0, 1))
      const out = easeInOut(mapRange(p, 0.3, 0.42, 0, 1))
      headRef.current.style.opacity = String((t * (1 - out)).toFixed(3))
      headRef.current.style.transform = `translate3d(0, ${(56 * (1 - t)).toFixed(2)}px, 0) scale(${(1.07 - t * 0.07).toFixed(4)})`
    }
    // 矩阵「聚→散」入场：滚动进度驱动（欢迎文字之后开始，卡片由内而外弹性散开）
    const matrixHost = matrixRef.current
    if (matrixHost) {
      let anim = matrixAnimRef.current
      if (!anim) {
        const cards = Array.from(matrixHost.querySelectorAll<HTMLElement>('.matrix-card'))
        const grid = matrixHost.querySelector<HTMLElement>('.matrix-space')
        if (cards.length && grid) {
          const data = cards.map((card) => {
            const row = card.offsetParent as HTMLElement | null
            const cx = (row?.offsetLeft ?? 0) + card.offsetLeft + card.offsetWidth / 2 - grid.offsetWidth / 2
            const cy = (row?.offsetTop ?? 0) + card.offsetTop + card.offsetHeight / 2 - grid.offsetHeight / 2
            return { gx: cx, gy: cy, gr: Math.random() * 10 - 5 }
          })
          anim = matrixAnimRef.current = { cards, data }
        }
      }
      if (anim) {
        anim.cards.forEach((card, i) => {
          const d = anim.data[i]
          const t = clamp01((p - (MATRIX_ENTR_START + i * MATRIX_STAGGER)) / MATRIX_ENTR_SPAN)
          const k = easeOutBack(t)
          card.style.transform = `translate(${(d.gx * (1 - k)).toFixed(2)}px, ${(d.gy * (1 - k)).toFixed(2)}px) scale(${(0.35 + 0.65 * k).toFixed(4)}) rotate(${(d.gr * (1 - k)).toFixed(2)}deg)`
          // 透明度从 0 起：文字先出现，矩阵到阶段才开始淡入 + 散开（保证「先文字后矩阵」）
          card.style.opacity = String(Math.min(1, k).toFixed(3))
        })
      }
    }

    // 矩阵离场：滚动到模块末尾时整体淡出 + 轻微收缩，交接下一幕
    if (matrixHost) {
      const out = easeInOut(mapRange(p, EXIT_START, EXIT_START + EXIT_DUR, 0, 1))
      matrixHost.style.opacity = String((1 - out).toFixed(3))
      matrixHost.style.filter = `blur(${(5 * out).toFixed(2)}px)`
      matrixHost.style.transform = `scale(${(1 - 0.05 * out).toFixed(4)})`
    }
  }

  useScrubMotion(trackRef, apply, { disabled: reduced || isMobile })

  // 窗口尺寸变化时重置聚散偏移缓存，下次 apply 重新测量（offset 不受 transform 影响，动画中也可安全重测）
  useEffect(() => {
    const onResize = (): void => {
      matrixAnimRef.current = null
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <section ref={trackRef} className={cn('ocean-deck', reduced && 'is-reduced', isMobile && 'is-mobile')} aria-label="网站信息展示">
      <div className="ocean-deck__stage">
        {/* 背景：深海之眼视频（放慢 4 倍）+ 视差缩放 */}
        <div ref={videoRef} className="ocean-deck__video">
          <SlowVideo src={cfg.ocean.video} poster={cfg.ocean.poster} className="ocean-deck__video-el" />
        </div>

        {/* 氛围层：水下渐变、体积光、入海幕布、气泡 */}
        <div className="ocean-deck__grad" aria-hidden="true" />
        <div className="ocean-deck__shafts" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ ['--i' as string]: i } as CSSProperties} />
          ))}
        </div>
        <div ref={veilRef} className="ocean-deck__veil" aria-hidden="true" />
        <div className="ocean-deck__bubbles" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              style={
                {
                  '--d': `${(i % 8) * 2.6}s`,
                  '--l': `${(i * 6.1 + 4) % 100}%`,
                  '--s': `${0.55 + (i % 5) * 0.24}s`,
                  '--z': `${(i % 3) + 1}`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        {/* 标题区 */}
        <header ref={headRef} className="ocean-deck__head">
          <p className="ocean-deck__kicker">
            <span className="ocean-deck__kicker-line" />
            {cfg.ocean.kicker}
            <span className="ocean-deck__kicker-line" />
          </p>
          <h2 className="ocean-deck__title">{cfg.ocean.title}</h2>
          <p className="ocean-deck__sub">{cfg.ocean.subtitle}</p>
        </header>

        {/* 规整三段式信息矩阵 */}
        <div ref={matrixRef} className="ocean-deck__matrix">
          <MatrixHolo staticMode={reduced || isMobile} />

        </div>

        <p className="ocean-deck__hint">SCROLL · 继续下潜</p>
      </div>
    </section>
  )
}



