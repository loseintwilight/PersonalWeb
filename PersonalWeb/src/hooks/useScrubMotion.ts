import { useEffect, useRef, type RefObject } from 'react'
import { clamp01, frameSmooth } from '@/utils/scroll'

export interface ScrubState {
  /** 当前进度 0..1（已平滑） */
  progress: number
  /** 视口高度 px */
  viewportH: number
  /** 轨道高度 px */
  trackH: number
}

interface ScrubOptions {
  /** 禁用滚动驱动（reduced-motion / 移动端降级） */
  disabled?: boolean
  /** 平滑速率（越大越跟手），默认 6 */
  smooth?: number
}

/**
 * 滚动驱动动画核心（等价 ScrollTrigger.scrub）：
 * 监听轨道元素的滚动进度，在 rAF 中以指数平滑趋近目标值，
 * 通过 onUpdate 直接写 style，全程不触发 React 重渲染。
 */
export function useScrubMotion<T extends HTMLElement>(
  trackRef: RefObject<T | null>,
  onUpdate: (state: ScrubState) => void,
  { disabled = false, smooth = 6 }: ScrubOptions = {},
): void {
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate
  const smoothRef = useRef(smooth)
  smoothRef.current = smooth

  useEffect(() => {
    const track = trackRef.current
    if (!track || disabled) return

    const state: ScrubState = { progress: 0, viewportH: 0, trackH: 0 }
    let raf = 0
    let running = false
    let target = 0

    const measure = (): void => {
      state.viewportH = window.innerHeight
      state.trackH = track.offsetHeight
    }
    const update = (): void => {
      const span = Math.max(1, state.trackH - state.viewportH)
      target = clamp01(-track.getBoundingClientRect().top / span)
    }
    const tick = (): void => {
      raf = 0
      if (disabled) {
        running = false
        return
      }
      const k = frameSmooth(smoothRef.current / 60)
      state.progress += (target - state.progress) * k
      if (Math.abs(target - state.progress) < 0.00035) state.progress = target
      onUpdateRef.current(state)
      running = Math.abs(target - state.progress) > 0.00035
      if (running) raf = requestAnimationFrame(tick)
    }
    const kick = (): void => {
      if (running) return
      running = true
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onScroll = (): void => {
      update()
      kick()
    }
    const onResize = (): void => {
      measure()
      update()
      state.progress = target
      onUpdateRef.current(state)
      kick()
    }

    measure()
    update()
    state.progress = target
    onUpdateRef.current(state)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [trackRef, disabled])
}
