import { useRef, type ReactNode } from 'react'

const LEFT_MIN = 200
const LEFT_MAX = 300
const RIGHT_MIN = 280
const RIGHT_MAX = 500

export function ThreePane({
  left,
  center,
  right,
  leftOpen,
  rightOpen,
  leftWidth,
  rightWidth,
  onLeftWidthChange,
  onRightWidthChange,
}: {
  left: ReactNode
  center: ReactNode
  right: ReactNode
  leftOpen: boolean
  rightOpen: boolean
  leftWidth: number
  rightWidth: number
  onLeftWidthChange: (w: number) => void
  onRightWidthChange: (w: number) => void
}) {
  return (
    <div className="flex-1 min-h-0 flex overflow-hidden bg-background text-foreground relative">
      {leftOpen && (
        <>
          <aside
            className="shrink-0 border-r bg-secondary/40 backdrop-blur-sm overflow-hidden relative z-20"
            style={{ width: leftWidth }}
          >
            {left}
          </aside>
          <Resizer
            side="left"
            currentSize={leftWidth}
            min={LEFT_MIN}
            max={LEFT_MAX}
            onResize={onLeftWidthChange}
          />
        </>
      )}
      <main className="flex-1 min-w-0 flex flex-col">{center}</main>
      {rightOpen && (
        <>
          <Resizer
            side="right"
            currentSize={rightWidth}
            min={RIGHT_MIN}
            max={RIGHT_MAX}
            onResize={onRightWidthChange}
          />
          <aside
            className="shrink-0 border-l overflow-hidden relative z-20"
            style={{ width: rightWidth }}
          >
            {right}
          </aside>
        </>
      )}
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function Resizer({
  side,
  currentSize,
  min,
  max,
  onResize,
}: {
  side: 'left' | 'right'
  currentSize: number
  min: number
  max: number
  onResize: (w: number) => void
}) {
  const startX = useRef<number | null>(null)
  const startSize = useRef(0)
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  const stop = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current == null) return
    startX.current = null
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    startX.current = e.clientX
    startSize.current = currentSize
    e.currentTarget.setPointerCapture(e.pointerId)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    const delta = side === 'left' ? dx : -dx
    onResizeRef.current(clamp(startSize.current + delta, min, max))
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      className="relative w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-border/80 active:bg-border transition-colors -mr-1 z-30"
    />
  )
}
