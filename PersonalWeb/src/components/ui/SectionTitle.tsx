import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

export function SectionTitle({ icon, title, subtitle, right }: { icon?: IconName; title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-8">
      <div className="section-head">
        {icon ? <Icon name={icon} size={22} className="text-[var(--accent)] shrink-0" /> : null}
        <h2 className="font-display text-2xl md:text-[1.7rem] font-bold tracking-wide text-[var(--ink)]">{title}</h2>
        <span className="rule" />
        {right}
      </div>
      {subtitle ? <p className="mt-2 text-sm text-[var(--ink-3)]">{subtitle}</p> : null}
    </div>
  )
}