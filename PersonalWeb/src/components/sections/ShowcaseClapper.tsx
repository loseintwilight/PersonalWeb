import { useRef } from 'react'
import { showcaseConfig } from '@/utils/content'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useScrubMotion, type ScrubState } from '@/hooks/useScrubMotion'
import { easeInOut, mapRange } from '@/utils/scroll'
import { AmbientAura } from '@/components/animation/AmbientAura'
import { ImmersiveShowcase } from '@/components/sections/ImmersiveShowcase'

/** 分镜线展开节奏：线出现 -> 两侧拉伸、文字变暗 -> 图片电影开幕 */
const LINE_IN = 0.06
const LINE_IN_DUR = 0.16
const LINE_OUT = 0.3
const LINE_OUT_DUR = 0.2
const SHOW_START = 0.5
const SHOW_STAGGER = 0.06
const SHOW_DUR = 0.16

/**
 * 作品展示过渡：电影分镜线。
 * 矩阵之后先进入深色空间，一条分镜线由中心拉开，线左边是内容、右边提示「下一幕 · 作品展示」；
 * 继续滚动，线向两侧拉伸、文字变暗，三张作品卡以「幕布向两侧拉开 + 暗到亮 + 模糊到清晰」的方式像电影开幕一样出现。
 */
export function ShowcaseClapper() {
  const reduced = usePrefersReducedMotion()
  const isMobile = useIsMobile(820)
  const cfg = showcaseConfig
  const trackRef = useRef<HTMLElement | null>(null)
  const lineRef = useRef<HTMLDivElement | null>(null)
  const labelLRef = useRef<HTMLDivElement | null>(null)
  const labelRRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const mediaRefs = useRef<(HTMLElement | null)[]>([])
  const shadeRefs = useRef<(HTMLElement | null)[]>([])

  const apply = (state: ScrubState): void => {
    const p = state.progress

    // 分镜线：先由中心向两侧展开，随后拉伸变宽、让位给作品画面
    const lineIn = easeInOut(mapRange(p, LINE_IN, LINE_IN + LINE_IN_DUR, 0, 1))
    const lineOut = easeInOut(mapRange(p, LINE_OUT, LINE_OUT + LINE_OUT_DUR, 0, 1))
    if (lineRef.current) {
      lineRef.current.style.transform = `translate3d(-50%, -50%, 0) scaleX(${((lineIn * (1 - lineOut) + lineOut * 2.6).toFixed(4))})`
      lineRef.current.style.opacity = String((lineIn * (1 - lineOut * 0.6)).toFixed(3))
    }

    // 左侧内容 / 右侧「下一幕」提示：淡入后随线展开逐渐变暗
    if (labelLRef.current) {
      const t = easeInOut(mapRange(p, LINE_IN + 0.04, LINE_IN + LINE_IN_DUR, 0, 1))
      const dim = easeInOut(mapRange(p, LINE_OUT + 0.03, LINE_OUT + LINE_OUT_DUR, 0, 1))
      labelLRef.current.style.opacity = String((t * (1 - dim)).toFixed(3))
      labelLRef.current.style.transform = `translate3d(${(-40 * (1 - t)).toFixed(2)}px, 0, 0)`
    }
    if (labelRRef.current) {
      const t = easeInOut(mapRange(p, LINE_IN + 0.04, LINE_IN + LINE_IN_DUR, 0, 1))
      const dim = easeInOut(mapRange(p, LINE_OUT + 0.03, LINE_OUT + LINE_OUT_DUR, 0, 1))
      labelRRef.current.style.opacity = String((t * (1 - dim)).toFixed(3))
      labelRRef.current.style.transform = `translate3d(${(40 * (1 - t)).toFixed(2)}px, 0, 0)`
    }

    // 作品图片电影开幕：幕布遮罩向两侧拉开 + 暗到亮 + 模糊到清晰
    cfg.items.forEach((_, i) => {
      const t = easeInOut(mapRange(p, SHOW_START + i * SHOW_STAGGER, SHOW_START + i * SHOW_STAGGER + SHOW_DUR, 0, 1))
      const card = cardRefs.current[i]
      const media = mediaRefs.current[i]
      const shade = shadeRefs.current[i]
      if (card) {
        card.style.opacity = String(t.toFixed(3))
        card.style.transform = `translate3d(0, ${(46 * (1 - t)).toFixed(2)}px, 0) scale(${(0.92 + 0.08 * t).toFixed(4)})`
        card.style.filter = `blur(${(20 * (1 - t)).toFixed(2)}px) brightness(${(0.5 + 0.5 * t).toFixed(3)})`
      }
      if (media) {
        const inset = (1 - t) * 50
        media.style.clipPath = `inset(0 ${inset.toFixed(2)}% 0 ${inset.toFixed(2)}%)`
      }
      if (shade) shade.style.opacity = String(((1 - t) * 0.92).toFixed(3))
    })
  }

  useScrubMotion(trackRef, apply, { disabled: reduced || isMobile })

  if (isMobile || reduced) {
    return <ImmersiveShowcase />
  }

  return (
    <section ref={trackRef} className="clapper" aria-label="作品展示">
      <div className="clapper__stage">
        {/* 深色背景 + 氛围 */}
        <div className="clapper__bg" aria-hidden="true">
          {cfg.bg ? <img src={cfg.bg} alt="" draggable={false} /> : null}
          <div className="clapper__shade" />
        </div>
        <AmbientAura orbs={false} density={0.8} className="clapper__particles" />

        {/* 电影分镜线：左边内容 / 右边下一幕提示 */}
        <div ref={lineRef} className="clapper__line" aria-hidden="true">
          <span className="clapper__line-dot" />
        </div>
        <div ref={labelLRef} className="clapper__label is-left">
          <p className="clapper__kicker">
            <span className="clapper__kicker-line" />
            NEXT SCENE
          </p>
          <h2 className="clapper__title">作品展示</h2>
          <p className="clapper__sub">{cfg.subtitle}</p>
        </div>
        <div ref={labelRRef} className="clapper__label is-right">
          <p>下一幕 · 作品展示</p>
          <span className="clapper__arrow" aria-hidden="true" />
        </div>

        {/* 作品卡片：幕布向两侧拉开后像电影开幕一样出现 */}
        <div className="showcase-row clapper__row">
          {cfg.items.map((item, i) => (
            <figure
              key={item.code}
              className="char-card clapper-card"
              ref={(el) => {
                cardRefs.current[i] = el
              }}
            >
              <div className="char-card__stage">
                <div className="char-card__media" ref={(el) => { mediaRefs.current[i] = el }}>
                  <div className="char-card__bg" aria-hidden="true">
                    <img src={item.image} alt="" draggable={false} loading="lazy" />
                  </div>
                  <img className="char-card__img" src={item.image} alt={item.title} draggable={false} loading="lazy" />
                  <div className="char-card__glow" aria-hidden="true" />
                  <div className="char-card__sweep" aria-hidden="true" />
                  <div className="char-card__edge" aria-hidden="true" />
                  <span ref={(el) => { shadeRefs.current[i] = el }} className="clapper-card__shade" aria-hidden="true" />
                  <span className="char-card__code">{item.code}</span>
                  <figcaption className="char-card__cap">
                    <span className="char-card__tag">{item.tags[0]}</span>
                    <h3 className="char-card__name">{item.title}</h3>
                    <p className="char-card__role">{item.subtitle}</p>
                  </figcaption>
                </div>
              </div>
            </figure>
          ))}
        </div>

        {/* HUD 底部提示 */}
        <div className="clapper__hud" aria-hidden="true">
          <span>FILM · CLAPPER BOARD</span>
          <span className="clapper__hud-dash" />
          <span>SCROLL</span>
        </div>
      </div>
    </section>
  )
}
