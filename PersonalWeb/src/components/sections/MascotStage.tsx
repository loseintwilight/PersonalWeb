import { useRef, type CSSProperties } from 'react'
import { immersiveConfig } from '@/utils/content'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useInView } from '@/hooks/useInView'
import { useScrubMotion, type ScrubState } from '@/hooks/useScrubMotion'
import { easeInOut, mapRange } from '@/utils/scroll'
import { AmbientAura } from '@/components/animation/AmbientAura'
import { cn } from '@/utils/cn'

/**
 * 第三模块：看板娘 + 上下双层壁纸融合
 * 严格顺序：黑色空间 -> 看板娘独自出现（缓慢放大 + 漂浮）
 * -> 上方壁纸自上展开、下方壁纸自下进入，两张壁纸向中间靠近
 * -> 名字在看板娘左右两侧差分显现（左侧剪影回声、右侧扫描点亮），最终形成完整的大型视觉场景。
 */
export function MascotStage() {
  const reduced = usePrefersReducedMotion()
  const isMobile = useIsMobile(820)
  const cfg = immersiveConfig
  const trackRef = useRef<HTMLElement | null>(null)
  const veilRef = useRef<HTMLDivElement | null>(null)
  const figureRef = useRef<HTMLElement | null>(null)
  const topBgRef = useRef<HTMLDivElement | null>(null)
  const bottomBgRef = useRef<HTMLDivElement | null>(null)
  const nameLRef = useRef<HTMLDivElement | null>(null)
  const nameRRef = useRef<HTMLDivElement | null>(null)
  const fillRef = useRef<HTMLHeadingElement | null>(null)
  const scanlineRef = useRef<HTMLSpanElement | null>(null)
  const sloganRef = useRef<HTMLParagraphElement | null>(null)
  const taglineRef = useRef<HTMLParagraphElement | null>(null)
  const { ref: sectionRef, inView } = useInView<HTMLElement>(0.12, '0px 0px -6% 0px')

  const apply = (state: ScrubState): void => {
    const p = state.progress
    const outT = easeInOut(mapRange(p, 0.95, 1, 0, 1))

    // 入海幕布：进入本模块先压暗再揭开
    if (veilRef.current) {
      const dive = easeInOut(mapRange(p, 0, 0.03, 0, 1))
      const clear = easeInOut(mapRange(p, 0.045, 0.11, 0, 1))
      veilRef.current.style.opacity = String((dive * (1 - clear)).toFixed(3))
    }

    // 第一阶段：看板娘独自出现（从下方缓慢放大浮起）
    if (figureRef.current) {
      const figT = easeInOut(mapRange(p, 0.08, 0.42, 0, 1))
      const scale = (0.55 + 0.45 * figT) * (1 - 0.16 * outT)
      const y = 92 * (1 - figT) - 36 * outT
      figureRef.current.style.opacity = String((figT * (1 - outT)).toFixed(3))
      figureRef.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
      figureRef.current.style.filter = `blur(${(16 * (1 - figT)).toFixed(2)}px)`
    }

    // 第二阶段：上方壁纸自上展开 / 下方壁纸自下进入（含缩放、视差、模糊到清晰）
    const topT = easeInOut(mapRange(p, 0.44, 0.68, 0, 1))
    const bottomT = easeInOut(mapRange(p, 0.5, 0.74, 0, 1))
    // 第三阶段：两张壁纸向中间靠近（视差收拢）
    const converge = easeInOut(mapRange(p, 0.7, 0.88, 0, 1))
    if (topBgRef.current) {
      const extra = 2.6 * converge
      const innerY = -2.2 * topT // 图片层轻微反向视差
      topBgRef.current.style.transform = `translate3d(0, ${(-100 * (1 - topT) + extra).toFixed(3)}%, 0)`
      topBgRef.current.style.opacity = String((topT * (1 - outT)).toFixed(3))
      topBgRef.current.style.filter = `blur(${(14 * (1 - topT)).toFixed(2)}px)`
      if (topBgRef.current.firstElementChild instanceof HTMLElement) {
        topBgRef.current.firstElementChild.style.transform = `translate3d(0, ${innerY.toFixed(2)}%, 0) scale(${(1.16 - 0.1 * topT).toFixed(4)})`
      }
    }
    if (bottomBgRef.current) {
      const extra = -2.6 * converge
      const innerY = 2.2 * bottomT
      bottomBgRef.current.style.transform = `translate3d(0, ${(100 * (1 - bottomT) + extra).toFixed(3)}%, 0)`
      bottomBgRef.current.style.opacity = String((bottomT * (1 - outT)).toFixed(3))
      bottomBgRef.current.style.filter = `blur(${(14 * (1 - bottomT)).toFixed(2)}px)`
      if (bottomBgRef.current.firstElementChild instanceof HTMLElement) {
        bottomBgRef.current.firstElementChild.style.transform = `translate3d(0, ${innerY.toFixed(2)}%, 0) scale(${(1.16 - 0.1 * bottomT).toFixed(4)})`
      }
    }

    // 第四阶段：名字在看板娘左右两侧做差分显现（左侧剪影回声，右侧扫描点亮）
    const nameT = easeInOut(mapRange(p, 0.72, 0.9, 0, 1))
    const nameTL = easeInOut(mapRange(p, 0.78, 0.94, 0, 1))
    const scan = easeInOut(mapRange(p, 0.74, 0.92, 0, 1))
    const s = 0.84 + 0.16 * scan
    if (nameLRef.current) {
      nameLRef.current.style.opacity = String((nameTL * (1 - outT)).toFixed(3))
      nameLRef.current.style.transform = `translate3d(0, ${(40 * (1 - nameTL)).toFixed(2)}px, 0) scale(${s.toFixed(4)})`
      nameLRef.current.style.letterSpacing = `${(0.26 - 0.16 * scan).toFixed(2)}em`
    }
    if (nameRRef.current) {
      nameRRef.current.style.opacity = String((nameT * (1 - outT)).toFixed(3))
      nameRRef.current.style.transform = `translate3d(0, ${(40 * (1 - nameT)).toFixed(2)}px, 0) scale(${s.toFixed(4)})`
      nameRRef.current.style.letterSpacing = `${(0.3 - 0.24 * scan).toFixed(2)}em`
    }
    if (fillRef.current) {
      const scan = easeInOut(mapRange(p, 0.74, 0.92, 0, 1))
      fillRef.current.style.clipPath = `inset(0 ${((1 - scan) * 100).toFixed(2)}% 0 0)`
      const glow = mapRange(p, 0.78, 0.92, 0, 1)
      fillRef.current.style.filter = `drop-shadow(0 0 ${(glow * 24).toFixed(1)}px rgba(127, 216, 255, ${(glow * 0.8).toFixed(3)}))`
    }
    if (scanlineRef.current) {
      const scan = easeInOut(mapRange(p, 0.74, 0.92, 0, 1))
      scanlineRef.current.style.left = `${(scan * 100).toFixed(2)}%`
      scanlineRef.current.style.opacity = String((scan * (1 - scan)).toFixed(3))
    }
    if (sloganRef.current) {
      const t = easeInOut(mapRange(p, 0.88, 0.97, 0, 1))
      sloganRef.current.style.opacity = String((t * (1 - outT)).toFixed(3))
      sloganRef.current.style.transform = `translate3d(0, ${(16 * (1 - t)).toFixed(2)}px, 0)`
    }
    if (taglineRef.current) {
      const t = easeInOut(mapRange(p, 0.92, 0.98, 0, 1))
      taglineRef.current.style.opacity = String((t * 0.85 * (1 - outT)).toFixed(3))
    }
  }

  useScrubMotion(trackRef, apply, { disabled: reduced || isMobile })

  return (
    <section
      ref={(el) => {
        trackRef.current = el
        sectionRef.current = el
      }}
      className={cn('mascot-stage', reduced && 'is-reduced', isMobile && 'is-mobile', inView && 'is-in')}
      aria-label="看板娘与名字"
    >
      <div className="mascot-stage__scene">
        {/* 第一阶段：黑色空间 + 氛围 */}
        <div className="mascot-stage__rays" aria-hidden="true">
          <span />
        </div>
        <AmbientAura orbs={false} density={0.7} className="mascot-stage__particles" />
        <div className="deep-bubbles mascot-stage__bubbles" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              style={
                {
                  '--d': `${(i % 6) * 3}s`,
                  '--l': `${(i * 8.7 + 4) % 100}%`,
                  '--s': `${0.5 + (i % 4) * 0.24}s`,
                  '--z': `${(i % 3) + 1}`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div ref={veilRef} className="mascot-stage__veil" aria-hidden="true" />

        {/* 第二/三阶段：上下双层横屏壁纸（看板娘作为中间分界线） */}
        <div ref={topBgRef} className="mascot-stage__wall is-top" aria-hidden="true">
          <img src={cfg.mascot.topBg} alt="" loading="lazy" draggable={false} />
        </div>
        <div ref={bottomBgRef} className="mascot-stage__wall is-bottom" aria-hidden="true">
          <img src={cfg.mascot.bottomBg} alt="" loading="lazy" draggable={false} />
        </div>

        {/* 第一阶段：看板娘主体 */}
        <figure ref={figureRef} className="mascot-stage__figure">
          <span className="mascot-stage__glow" aria-hidden="true" />
          <span className="mascot-stage__float">
            <img src={cfg.mascot.image} alt={cfg.mascot.alt} draggable={false} />
          </span>
        </figure>

        {/* 第四阶段：名字在看板娘左右两侧差分显现 */}
        <div className="mascot-stage__names">
          <div ref={nameLRef} className="mascot-stage__namebox is-left" aria-hidden="true">
            <h2 className="mascot-stage__name is-base">{cfg.mascot.name}</h2>
          </div>
          <div ref={nameRRef} className="mascot-stage__namebox is-right">
            <h2 className="mascot-stage__name is-base" aria-hidden="true">
              {cfg.mascot.name}
            </h2>
            <h2 ref={fillRef} className="mascot-stage__name is-fill">
              {cfg.mascot.name}
            </h2>
            <span ref={scanlineRef} className="mascot-stage__scan" aria-hidden="true" />
          </div>
        </div>
        <div className="mascot-stage__title">
          <p ref={sloganRef} className="mascot-stage__slogan">
            <span className="mascot-stage__slogan-line" />
            {cfg.mascot.slogan}
            <span className="mascot-stage__slogan-line" />
          </p>
          <p ref={taglineRef} className="mascot-stage__tagline">{cfg.mascot.tagline}</p>
        </div>
      </div>
    </section>
  )
}
