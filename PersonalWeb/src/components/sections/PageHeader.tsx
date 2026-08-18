import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Reveal } from '@/components/animation/Reveal'

export function PageHeader({ icon, title, subtitle, children }: { icon: IconName; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="pt-28 pb-10">
      <Reveal className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs tracking-[0.3em] text-[var(--ink-3)]">
              <Icon name="compass" size={14} className="text-[var(--accent)]" />
              VOYAGE LOG
            </p>
            <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-[var(--ink)] md:text-[2.5rem]">
              <Icon name={icon} size={30} className="text-[var(--accent)]" />
              <span className="title-gradient">{title}</span>
            </h1>
            {subtitle ? <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-2)] md:text-base">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </Reveal>
    </div>
  )
}