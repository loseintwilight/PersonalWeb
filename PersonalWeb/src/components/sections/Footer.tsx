import { Link } from 'react-router-dom'
import { CountUp } from '@/components/animation/CountUp'
import { Icon } from '@/components/ui/Icon'

function voyageDays(): number {
  const start = new Date('2024-01-01')
  return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1)
}

export function Footer() {
  return (
    <footer className="relative z-10 mt-20">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-4">
        <div className="glass-card px-8 py-8 md:px-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-lg font-bold text-[var(--ink)]">
                <Icon name="sailboat" size={22} className="text-[var(--accent)]" />
                <span className="font-display">启航</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-3)]">
                个人技术博客与作品集
                <br />
                记录技术海洋中的探索与成长。
              </p>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[var(--ink-3)]">导航 NAVIGATION</p>
              <ul className="grid grid-cols-2 gap-2 text-sm text-[var(--ink-2)]">
                <li><Link className="link-underline" to="/">港湾</Link></li>
                <li><Link className="link-underline" to="/log">航海日志</Link></li>
                <li><Link className="link-underline" to="/chart">星图</Link></li>
                <li><Link className="link-underline" to="/wake">航迹</Link></li>
                <li><Link className="link-underline" to="/about">关于</Link></li>
                <li><Link className="link-underline" to="/bottle">漂流瓶</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[var(--ink-3)]">航程 VOYAGE</p>
              <p className="text-sm text-[var(--ink-2)]">
                建站于 2024 · 已航行{' '}
                <CountUp value={voyageDays()} suffix=" 天" className="font-semibold text-[var(--accent)]" />
              </p>
              <p className="mt-2 text-xs text-[var(--ink-3)]">扬帆，启航。前方是星辰大海。</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[var(--card-border)] pt-5 text-xs text-[var(--ink-3)] md:flex-row">
            <p>© 2024-2026 Loseintwilight · 启航 Harbor</p>
            <p className="flex items-center gap-1.5">
              <Icon name="heart" size={13} className="text-[var(--accent)]" />
              Built with React · Vite · Three.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}