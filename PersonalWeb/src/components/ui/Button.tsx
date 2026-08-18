import type { CSSProperties, ReactNode, MouseEventHandler } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  to?: string
  href?: string
  type?: 'button' | 'submit'
  className?: string
  style?: CSSProperties
  onClick?: MouseEventHandler<HTMLElement>
  disabled?: boolean
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'text-sm px-4 py-1.5',
  md: 'text-[0.95rem] px-6 py-2.5',
  lg: 'text-base px-8 py-3.5',
}

export function Button({ children, variant = 'primary', size = 'md', to, href, type = 'button', className, style, onClick, disabled }: ButtonProps) {
  const classes = cn('btn', variant === 'primary' ? 'btn-primary' : 'btn-ghost', sizeClass[size], className)
  if (to) {
    return (
      <Link to={to} className={classes} style={style} onClick={onClick}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} style={style} target="_blank" rel="noreferrer" onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <button type={type} className={classes} style={style} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}