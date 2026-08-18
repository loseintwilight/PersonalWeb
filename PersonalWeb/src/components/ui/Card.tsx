import type { HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div className={cn('glass-card', hover && 'glass-card-hover', className)} {...props}>
      {children}
    </div>
  )
}