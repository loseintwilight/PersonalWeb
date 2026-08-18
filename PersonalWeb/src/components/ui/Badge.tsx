import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Badge({ children, active = false, className, onClick }: { children: ReactNode; active?: boolean; className?: string; onClick?: () => void }) {
  return (
    <span className={cn('chip', active && 'chip-active', className)} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </span>
  )
}