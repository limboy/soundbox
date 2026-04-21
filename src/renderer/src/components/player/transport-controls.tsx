import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { basename } from '@/lib/audio-extensions'
import { msToClock } from '@/lib/format-time'
import { usePlayer } from '@/store/player-store'

const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2]

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
  const volume = usePlayer((s) => s.volume)
  const muted = usePlayer((s) => s.muted)
  const rate = usePlayer((s) => s.rate)
  const setVolume = usePlayer((s) => s.setVolume)
  const setMuted = usePlayer((s) => s.setMuted)
  const setRate = usePlayer((s) => s.setRate)
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

  const cycleRate = (): void => {
    const i = RATES.indexOf(rate)
    setRate(RATES[(i + 1) % RATES.length])
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={onPrev}
          disabled={!selectedAudio}
          title="Previous"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={toggle}
          disabled={!selectedAudio}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={onNext}
          disabled={!selectedAudio}
          title="Next"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <div className="ml-2 min-w-0 flex-1 truncate text-sm">
          {selectedAudio ? (
            <span className="font-medium">{basename(selectedAudio)}</span>
          ) : (
            <span className="text-muted-foreground">No track selected</span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={cycleRate}
          className="h-7 w-14 text-xs tabular-nums"
          title="Playback speed"
        >
          {rate.toFixed(2)}×
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={() => setMuted(!muted)}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider
          className="w-24"
          value={[Math.round(volume * 100)]}
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => {
            setVolume(v[0] / 100)
            if (muted && v[0] > 0) setMuted(false)
          }}
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">
          {msToClock(currentTimeMs)}
        </span>
        <Slider
          className="flex-1"
          value={[currentTimeMs]}
          min={0}
          max={Math.max(durationMs, 1)}
          step={100}
          disabled={!selectedAudio || durationMs === 0}
          onValueChange={(v) => requestSeek(v[0])}
        />
        <span className="w-12 text-xs tabular-nums text-muted-foreground">
          {msToClock(durationMs)}
        </span>
      </div>
    </div>
  )
}
