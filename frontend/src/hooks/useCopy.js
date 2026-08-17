import { useState, useCallback } from 'react'
import { copyToClipboard } from '../utils/clipboard'

export function useCopy() {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text) => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    return success
  }, [])

  return { copy, copied }
}
