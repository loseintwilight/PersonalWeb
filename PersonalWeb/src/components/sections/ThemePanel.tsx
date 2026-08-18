import { useState } from 'react'
import { seasons, weathers } from '@/themes'
import { useTheme } from '@/hooks/useTheme'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/utils/cn'

const seasonSwatches: Record<string, string> = {
  spring: 'linear-gradient(135deg,#bce6ff 0%,#fff6e3 55%,#f9c8d8 100%)',
  summer: 'linear-gradient(135deg,#3aa0ff 0%,#9fd8ff 55%,#ffd98a 100%)',
  autumn: 'linear-gradient(135deg,#ffb35c 0%,#ffd9a3 55%,#e76f51 100%)',
  winter: 'linear-gradient(135deg,#0b1638 0%,#233a63 55%,#a7a0ff 100%)',
}

/** 季节 / 天气主题控制面板（localStorage 持久化） */
export function ThemePanel() {
  const [open, setOpen] = useState(false)
  const { season, weather, isCustom, setSeason, setWeather, reset } = useTheme()

  return (
    <>
      <button
        className="btn-icon fixed bottom-6 right-6 z-50 h-12 w-12 shadow-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label="主题设置"
        title="季节与天气主题"
      >
        <Icon name="palette" size={20} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="theme-panel fixed bottom-20 right-6 z-50 w-[320px] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-[var(--ink)]">季节与天气</h3>
              <button className="btn-icon h-8 w-8" onClick={() => setOpen(false)} aria-label="关闭">
                <Icon name="x" size={16} />
              </button>
            </div>

            <p className="mb-2 text-xs font-medium tracking-widest text-[var(--ink-3)]">季节 SEASON</p>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {seasons.map((s) => (
                <button
                  key={s.id}
                  className={cn('theme-swatch p-1.5', season === s.id && 'active')}
                  onClick={() => setSeason(s.id)}
                  title={s.hint}
                >
                  <span
                    className="block h-10 w-full rounded-lg"
                    style={{ background: seasonSwatches[s.id] }}
                  />
                  <span className="mt-1 block text-center text-xs text-[var(--ink-2)]">
                    {s.emoji} {s.label}
                  </span>
                </button>
              ))}
            </div>

            <p className="mb-2 text-xs font-medium tracking-widest text-[var(--ink-3)]">天气 WEATHER</p>
            <div className="mb-5 flex flex-wrap gap-2">
              {weathers.map((wt) => (
                <button
                  key={wt.id}
                  className={cn('chip', weather === wt.id && 'chip-active')}
                  onClick={() => setWeather(wt.id)}
                >
                  {wt.emoji} {wt.label}
                </button>
              ))}
            </div>

            <button
              className="btn btn-ghost w-full text-sm"
              onClick={() => {
                reset()
                setOpen(false)
              }}
            >
              <Icon name="reset" size={15} />
              恢复页面默认主题
            </button>
            {isCustom && <p className="mt-2 text-center text-[11px] text-[var(--ink-3)]">已使用自定义主题（保存在本地）</p>}
          </div>
        </>
      )}
    </>
  )
}