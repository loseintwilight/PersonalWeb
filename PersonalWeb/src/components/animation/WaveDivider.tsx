import { cn } from '@/utils/cn'

function wavePath(amp: number, cycles: number, phase: number, baseY: number): string {
  const total = 2880
  const step = 14
  const period = total / cycles
  let d = ''
  for (let x = 0; x <= total; x += step) {
    const y = baseY + Math.sin(((x % period) / period) * Math.PI * 2 + phase) * amp
    d += `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)} `
  }
  return `${d}L${total} 120 L0 120 Z`
}

const LAYERS = [
  { d: wavePath(14, 6, 0, 96), fill: 'var(--sea-light)', opacity: 0.85, speed: 'slower', duration: '38s' },
  { d: wavePath(22, 4, 1.1, 102), fill: 'var(--sea-mid)', opacity: 0.9, speed: 'slow', duration: '26s' },
  { d: wavePath(10, 8, 0.4, 108), fill: 'var(--sea-deep)', opacity: 0.95, speed: '', duration: '16s' },
]

/** 波浪分割线：多层 SVG 横向循环（CSS transform 动画，性能友好） */
export function WaveDivider({ flip = false, className, height = 'h-14 md:h-20' }: { flip?: boolean; className?: string; height?: string }) {
  return (
    <div className={cn('relative w-full overflow-hidden pointer-events-none', height, flip && 'rotate-180', className)} aria-hidden="true">
      {LAYERS.map((layer, i) => (
        <svg
          key={i}
          className={cn('wave-svg absolute inset-x-0 bottom-0 h-full', layer.speed)}
          style={{ animationDuration: layer.duration, opacity: layer.opacity }}
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
        >
          <path d={layer.d} fill={layer.fill} />
        </svg>
      ))}
    </div>
  )
}