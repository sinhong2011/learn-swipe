import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    if (!title) return
    document.title = title
  }, [title])
}
