import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function UpdateIndicator(): React.JSX.Element | null {
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    const off = window.soundbox.update.onUpdateReady((info) => {
      setUpdateVersion(info.version)
    })

    if (import.meta.env.DEV) {
      ; (window as unknown as { __triggerUpdatePreview?: (v?: string) => void }).__triggerUpdatePreview =
        (version = '1.0.1') => {
          setUpdateVersion(version)
        }
    }

    return off
  }, [])

  if (!updateVersion) return null

  const handleApply = (): void => {
    setApplying(true)
    void window.soundbox.update.apply()
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-amber-600 hover:bg-amber-50 hover:text-amber-600 h-6 px-3 text-xs shrink-0 rounded-full border-amber-600 transition-all"
      disabled={applying}
      onClick={handleApply}
    >
      <span>{applying ? 'Restarting' : 'Update'}</span>
    </Button>
  )
}
