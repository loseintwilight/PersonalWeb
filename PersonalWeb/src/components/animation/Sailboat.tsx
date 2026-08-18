import { cn } from '@/utils/cn'

/** SVG 帆船：CSS 横向航行 + 船体起伏（2D 层，纯 transform 动画） */
export function Sailboat({ className, duration = 38 }: { className?: string; duration?: number }) {
  return (
    <div
      className={cn('pointer-events-none absolute', className)}
      style={{ animation: `sail ${duration}s linear infinite` }}
      aria-hidden="true"
    >
      <div style={{ animation: 'bob 4.6s ease-in-out infinite' }}>
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
          {/* 船体 */}
          <path d="M12 62h96l-12 14H24z" fill="var(--sea-deep)" opacity="0.85" />
          <path d="M18 60h84l-8 10H26z" fill="#f4efe6" stroke="var(--ink)" strokeOpacity="0.25" />
          {/* 主帆 */}
          <path d="M60 56V12c-10 8-16 20-16 34z" fill="#fffdf5" stroke="var(--accent)" strokeWidth="2" opacity="0.95" />
          {/* 前帆 */}
          <path d="M62 52V18c8 6 12 16 12 28z" fill="var(--accent)" opacity="0.75" />
          {/* 桅杆 */}
          <line x1="60" y1="10" x2="60" y2="58" stroke="var(--ink)" strokeOpacity="0.5" strokeWidth="2" />
          {/* 旗 */}
          <path d="M60 10c6 1.5 9 4 10 7-3 1-6.5 1-10 1z" fill="var(--accent)" />
        </svg>
      </div>
    </div>
  )
}