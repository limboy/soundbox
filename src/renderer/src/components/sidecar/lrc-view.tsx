import Lyric from 'lrc-file-parser'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { findActiveIndexByStart, type TimedLine } from '@/lib/active-line'
import { cn } from '@/lib/utils'
import { usePlayer } from '@/store/player-store'

export function LrcView({ content }: { content: string }): React.JSX.Element {
  const [lines, setLines] = useState<TimedLine[]>([])

  useEffect(() => {
    let applied = false
    const parser = new Lyric({
      onPlay: () => {},
      onSetLyric: (parsed) => {
        if (applied) return
        applied = true
        setLines(
          parsed
            .map((l: { time: number; text: string }) => ({ time: l.time, text: l.text }))
            .filter((l) => l.text.trim().length > 0)
        )
      }
    })
    parser.setLyric(content)
    return () => {
      parser.pause()
    }
  }, [content])

  return <TimedTextList lines={lines} />
}

export function TimedTextList({ lines }: { lines: TimedLine[] }): React.JSX.Element {
  const currentTimeMs = usePlayer((s) => s.currentTimeMs)
  const requestSeek = usePlayer((s) => s.requestSeek)
  const hint = useRef(0)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const lastScrollAt = useRef(0)

  const active = useMemo(() => {
    const idx = findActiveIndexByStart(lines, currentTimeMs, hint.current)
    hint.current = Math.max(0, idx)
    return idx
  }, [lines, currentTimeMs])

  useEffect(() => {
    if (active < 0) return
    const now = performance.now()
    if (now - lastScrollAt.current < 180) return
    lastScrollAt.current = now
    const el = itemRefs.current[active]
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [active])

  if (lines.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        No timed lines in this file.
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-4">
        {lines.map((line, i) => {
          const isActive = i === active
          return (
            <button
              key={`${i}-${line.time}`}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              type="button"
              onClick={() => requestSeek(line.time)}
              className={cn(
                'rounded-md px-2 py-1 text-left text-sm leading-relaxed transition-colors',
                isActive
                  ? 'bg-primary/10 font-semibold text-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              {line.text || '♪'}
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
