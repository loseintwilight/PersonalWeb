import { useRef, type CSSProperties } from 'react'
import { immersiveConfig } from '@/utils/content'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useInView } from '@/hooks/useInView'
import { useScrubMotion, type ScrubState } from '@/hooks/useScrubMotion'
import { easeInOut, mapRange } from '@/utils/scroll'
import { AmbientAura } from '@/components/animation/AmbientAura'
import { cn } from '@/utils/cn'

/** 四大特色展示墙：四张竖屏壁纸并排展开，长短不一、逐张点亮，最终铺满屏幕 */
/** 每张特色出现的滚动窗口 */
const REVEAL_START = 0.09
const REVEAL_STEP = 0.205
const REVEAL_DUR = 0.17

function CurtainActMobile({ item, index }: { item: (typeof immersiveConfig.features)[number]; index: number }) {
  const { ref, inView } = useInView<HTMLLIElement>(0.2)
  return (
    <li ref={ref} className={cn('curtain-mobile__item', inView && 'is-in')} data-i={index}>
      <div className="curtain-mobile__media">
        <img src={item.image} alt={item.title} loading="lazy" />
      </div>
      <span className="curtain-mobile__curtain is-left" aria-hidden="true" />
      <span className="curtain-mobile__curtain is-right" aria-hidden="true" />
      <div className="curtain-mobile__cap">
        <span className="curtain-mobile__code">{item.code}</span>
        <h3>{item.title}</h3>
        <p className="curtain-mobile__sub">{item.subtitle}</p>
        <p className="curtain-mobile__desc">{item.desc}</p>
      </div>
    </li>
  )
}

/**
 * 第二模块：四大特色 · 竖屏壁纸展示墙
 * 四张竖屏壁纸初始全部隐藏，滚动时逐张「从屏幕下方进入 → 幕布向两侧拉开 → 放大定型」，
 * 整墙高度随进度从约一半屏幕逐渐长高，从 1 张 → 2 张 → 3 张 → 4 张依次点亮，
 * 最终四张壁纸无缝拼成铺满整个视口的「四大特色展示墙」（无标题、无背景外露）。
 */
export function FeatureCurtain() {
  const reduced = usePrefersReducedMotion()
  const isMobile = useIsMobile(820)
  const cfg = immersiveConfig
  const trackRef = useRef<HTMLElement | null>(null)
  const veilRef = useRef<HTMLDivElement | null>(null)
  const counterRef = useRef<HTMLSpanElement | null>(null)
  const barRef = useRef<HTMLSpanElement | null>(null)
  const stripRefs = useRef<(HTMLElement | null)[]>([])
  const imgRefs = useRef<(HTMLImageElement | null)[]>([])
  const capRefs = useRef<(HTMLElement | null)[]>([])
  const curtainLRefs = useRef<(HTMLElement | null)[]>([])
  const curtainRRefs = useRef<(HTMLElement | null)[]>([])
  const seamRefs = useRef<(HTMLElement | null)[]>([])

  const apply = (state: ScrubState): void => {
    const p = state.progress
    const n = cfg.features.length

    // 入海幕布：模块入口先压暗再揭开，延续「深入大海」的转场感
    if (veilRef.current) {
      const dive = easeInOut(mapRange(p, 0, 0.028, 0, 1))
      const clear = easeInOut(mapRange(p, 0.03, 0.07, 0, 1))
      veilRef.current.style.opacity = String((dive * (1 - clear)).toFixed(3))
    }

    // 每张壁纸：滚动进度驱动的「点亮」进度（0..1，展开后保持）
    const revealT = cfg.features.map((_, i) =>
      easeInOut(mapRange(p, REVEAL_START + i * REVEAL_STEP, REVEAL_START + i * REVEAL_STEP + REVEAL_DUR)),
    )

    cfg.features.forEach((_, i) => {
      const t = revealT[i]
      const strip = stripRefs.current[i]
      const img = imgRefs.current[i]
      const cap = capRefs.current[i]
      const curtainL = curtainLRefs.current[i]
      const curtainR = curtainRRefs.current[i]
      const seam = seamRefs.current[i]

      const enterY = (1 - t) * 14 // 从下方进入
      const stripScale = 0.82 + 0.18 * t // scale(0.82) -> scale(1)
      const openT = easeInOut(mapRange(t, 0.08, 0.92)) // 幕布拉开进度
      const grow = easeInOut(mapRange(p, 0.14, 1, 0.52, 1)) // 整墙高度从一半长高到铺满

      if (strip) {
        strip.style.height = `${(50 + 50 * grow).toFixed(2)}vh`
        strip.style.opacity = t.toFixed(3)
        strip.style.transform = `translate3d(0, ${enterY.toFixed(3)}vh, 0) scale(${stripScale.toFixed(4)})`
        strip.style.filter = `blur(${(7 * (1 - t)).toFixed(2)}px)`
      }
      if (img) {
        // 幕布拉开时画面由暗转亮、轻微推近，形成「画面暴露」的镜头感
        img.style.filter = `brightness(${(0.5 + 0.5 * openT).toFixed(3)})`
        img.style.transform = `scale(${(1.18 - 0.12 * openT).toFixed(4)})`
      }
      if (curtainL) curtainL.style.transform = `translate3d(${(-100 * openT).toFixed(3)}%, 0, 0)`
      if (curtainR) curtainR.style.transform = `translate3d(${(100 * openT).toFixed(3)}%, 0, 0)`
      if (seam) seam.style.opacity = String((1 - openT).toFixed(3))
      if (cap) cap.style.opacity = String(easeInOut(mapRange(openT, 0.55, 1, 0, 1)).toFixed(3))
    })

    if (counterRef.current) {
      const idx = Math.min(n, Math.max(1, Math.floor((p - REVEAL_START) / REVEAL_STEP) + 1))
      counterRef.current.textContent = `SCENE ${String(idx).padStart(2, '0')} / ${String(n).padStart(2, '0')}`
    }
    if (barRef.current) barRef.current.style.transform = `scaleX(${mapRange(p, 0.04, 0.98, 0, 1).toFixed(4)})`
  }

  useScrubMotion(trackRef, apply, { disabled: reduced || isMobile })

  if (isMobile || reduced) {
    return (
      <section className={cn('feature-curtain feature-curtain--mobile', reduced && 'is-reduced')} aria-label="四大特色">
        <ol className="curtain-mobile">
          {cfg.features.map((item, i) => (
            <CurtainActMobile key={item.code} item={item} index={i} />
          ))}
        </ol>
      </section>
    )
  }

  return (
    <section ref={trackRef} className="feature-curtain" aria-label="四大特色">
      <div className="feature-curtain__stage">
        {/* 背景空间 */}
        <div className="feature-curtain__bg" aria-hidden="true">
          <span className="feature-curtain__orb" />
          <span className="feature-curtain__grid" />
        </div>
        <AmbientAura orbs={false} density={0.7} className="feature-curtain__particles" />
        <div className="deep-bubbles feature-curtain__bubbles" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              style={
                {
                  '--d': `${(i % 6) * 2.8}s`,
                  '--l': `${(i * 9.3 + 6) % 100}%`,
                  '--s': `${0.5 + (i % 4) * 0.26}s`,
                  '--z': `${(i % 3) + 1}`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div ref={veilRef} className="feature-curtain__veil" aria-hidden="true" />

        {/* 四大特色竖屏展示墙：逐张点亮，最终铺满屏幕 */}
        <div className="feature-curtain__wall">
          {cfg.features.map((item, i) => (
            <figure
              key={item.code}
              className="feature-curtain__strip"
              ref={(el) => {
                stripRefs.current[i] = el
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                draggable={false}
                ref={(el) => {
                  imgRefs.current[i] = el
                }}
              />
              <span className="feature-curtain__strip-shade" aria-hidden="true" />
              <span
                ref={(el) => {
                  curtainLRefs.current[i] = el
                }}
                className="feature-curtain__strip-curtain is-left"
                aria-hidden="true"
              />
              <span
                ref={(el) => {
                  curtainRRefs.current[i] = el
                }}
                className="feature-curtain__strip-curtain is-right"
                aria-hidden="true"
              />
              <span
                ref={(el) => {
                  seamRefs.current[i] = el
                }}
                className="feature-curtain__strip-seam"
                aria-hidden="true"
              />
              <figcaption
                className="feature-curtain__strip-cap"
                ref={(el) => {
                  capRefs.current[i] = el
                }}
              >
                <span className="feature-curtain__strip-cap-code">{item.code}</span>
                <h3>{item.title}</h3>
                <p className="feature-curtain__strip-cap-sub">{item.subtitle}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* HUD：场景序号 + 进度条 */}
        <div className="feature-curtain__hud" aria-hidden="true">
          <span ref={counterRef} className="feature-curtain__counter">
            SCENE 01 / 04
          </span>
          <div className="feature-curtain__bar">
            <span ref={barRef} />
          </div>
        </div>
      </div>
    </section>
  )
}
