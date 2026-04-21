import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { basename } from '@/lib/audio-extensions'
import { msToClock } from '@/lib/format-time'
import { usePlayer } from '@/store/player-store'
import { cn } from '@/lib/utils'

type Props = {
  audioRef: React.RefObject<HTMLAudioElement | null>
  selectedAudio: string | null
  onPrev: () => void
  onNext: () => void
}

export function TransportControls({
  audioRef,
  selectedAudio,
  onPrev,
  onNext
}: Props): React.JSX.Element {
  const isPlaying = usePlayer((s) => s.isPlaying)
  const currentTimeMs = usePlayer((s) => s.currentTimeMs)
  const durationMs = usePlayer((s) => s.durationMs)
  const shuffle = usePlayer((s) => s.shuffle)
  const loopMode = usePlayer((s) => s.loopMode)
  const setShuffle = usePlayer((s) => s.setShuffle)
  const setLoopMode = usePlayer((s) => s.setLoopMode)
  const requestSeek = usePlayer((s) => s.requestSeek)

  const toggle = (): void => {
    const a = audioRef.current
    if (!a || !selectedAudio) return
    if (a.paused) {
      a.play().catch((err) => {
        console.error('[TransportControls] play failed:', err)
      })
    } else {
      a.pause()
    }
  }

  const toggleShuffle = () => setShuffle(!shuffle)

  const toggleLoop = () => {
    if (loopMode === 'off') setLoopMode('all')
    else if (loopMode === 'all') setLoopMode('one')
    else setLoopMode('off')
  }

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {/* Part 1: Song Title */}
      <div className="flex w-full max-w-xl flex-col items-center gap-1 px-4">
        <h2 className="line-clamp-1 text-center text-lg font-bold tracking-tight text-foreground transition-all">
          {selectedAudio ? basename(selectedAudio) : 'Ready to play'}
        </h2>
      </div>

      {/* Part 2: Progress Bar */}
      <div className="flex w-full max-w-3xl flex-col gap-1 px-8">
        <Slider
          className="cursor-pointer"
          value={[currentTimeMs]}
          min={0}
          max={Math.max(durationMs, 1)}
          step={100}
          disabled={!selectedAudio || durationMs === 0}
          onValueChange={(v) => requestSeek(v[0])}
        />
        <div className="flex justify-between px-0.5">
          <span className="text-[10px] font-medium tabular-nums text-muted-foreground/70">
            {msToClock(currentTimeMs)}
          </span>
          <span className="text-[10px] font-medium tabular-nums text-muted-foreground/70">
            {msToClock(durationMs)}
          </span>
        </div>
      </div>

      {/* Part 3: Controller */}
      <div className="flex items-center gap-8 text-muted-foreground/80">
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-9 w-9 transition-colors",
            shuffle ? "text-primary hover:text-primary/80" : "hover:text-foreground"
          )}
          onClick={toggleShuffle}
          title="Shuffle"
        >
          <Shuffle className={cn("h-[18px] w-[18px]", shuffle && "fill-primary/20")} />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 hover:text-foreground hover:bg-transparent transition-all active:scale-90"
          onClick={onPrev}
          disabled={!selectedAudio}
          title="Previous"
        >
          <SkipBack className="h-6 w-6 fill-current" />
        </Button>

        <Button
          size="icon"
          className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95 shadow-lg"
          onClick={toggle}
          disabled={!selectedAudio}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="h-7 w-7 fill-current" />
          ) : (
            <Play className="h-7 w-7 fill-current translate-x-0.5" />
          )}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 hover:text-foreground hover:bg-transparent transition-all active:scale-90"
          onClick={onNext}
          disabled={!selectedAudio}
          title="Next"
        >
          <SkipForward className="h-6 w-6 fill-current" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-9 w-9 transition-colors",
            loopMode !== 'off' ? "text-primary hover:text-primary/80" : "hover:text-foreground"
          )}
          onClick={toggleLoop}
          title={loopMode === 'one' ? 'Repeat One' : loopMode === 'all' ? 'Repeat All' : 'Repeat Off'}
        >
          {loopMode === 'one' ? (
            <Repeat1 className="h-[18px] w-[18px]" />
          ) : (
            <Repeat className={cn("h-[18px] w-[18px]", loopMode === 'all' && "fill-primary/20")} />
          )}
        </Button>
      </div>
    </div>
  )

}


