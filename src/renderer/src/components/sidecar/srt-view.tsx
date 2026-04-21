import { useEffect, useMemo, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { findActiveCueIndex, type Cue } from '@/lib/active-line'
import { parseSubtitle } from '@/lib/subtitle-parse'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/store/player-store'

export function SrtView({ content }: { content: string }): React.JSX.Element {
  const cues = useMemo<Cue[]>(() => {
    try {
      return parseSubtitle(content)
    } catch {
      return []
    }
  }, [content])

  const currentTimeMs = usePlayer((s) => s.currentTimeMs)
  const requestSeek = usePlayer((s) => s.requestSeek)
  const hint = useRef(0)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const lastScrollAt = useRef(0)

  const active = useMemo(() => {
    const idx = findActiveCueIndex(cues, currentTimeMs, hint.current)
    if (idx >= 0) hint.current = idx
    return idx
  }, [cues, currentTimeMs])

  useEffect(() => {
    if (active < 0) return
    const now = performance.now()
    if (now - lastScrollAt.current < 180) return
    lastScrollAt.current = now
    const el = itemRefs.current[active]
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [active])

  if (cues.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        No cues found.
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-4">
        {cues.map((cue, i) => {
          const isActive = i === active
          return (
            <button
              key={`${i}-${cue.start}`}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              type="button"
              onClick={() => requestSeek(cue.start)}
              className={cn(
                'whitespace-pre-wrap rounded-md px-2 py-1 text-left text-sm leading-relaxed transition-colors',
                isActive
                  ? 'bg-primary/10 font-semibold text-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              {cue.text.replace(/<[^>]+>/g, '')}
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
