import { useEffect } from 'react'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} - 启航` : '启航 · Loseintwilight'
  }, [title])
}