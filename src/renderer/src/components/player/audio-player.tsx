import { useEffect, useRef } from 'react'
import { pathToLocalUrl } from '@/lib/audio-extensions'
import { secondsToMs } from '@/lib/format-time'
import { useLibrary, findDirNode, audioChildren } from '@/store/library-store'
import { usePlayer } from '@/store/player-store'
import { TransportControls } from './transport-controls'

export function AudioPlayer(): React.JSX.Element {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const selectedAudio = useLibrary((s) => s.selectedAudio)
  const tree = useLibrary((s) => s.tree)
  const selectAudio = useLibrary((s) => s.selectAudio)

  const setPlaying = usePlayer((s) => s.setPlaying)
  const setCurrentTimeMs = usePlayer((s) => s.setCurrentTimeMs)
  const setDurationMs = usePlayer((s) => s.setDurationMs)
  const volume = usePlayer((s) => s.volume)
  const muted = usePlayer((s) => s.muted)
  const rate = usePlayer((s) => s.rate)
  const seekRequestMs = usePlayer((s) => s.seekRequestMs)
  const clearSeekRequest = usePlayer((s) => s.clearSeekRequest)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = volume
  }, [volume])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.muted = muted
  }, [muted])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.playbackRate = rate
  }, [rate])

  useEffect(() => {
    const a = audioRef.current
    if (!a || seekRequestMs == null) return
    a.currentTime = seekRequestMs / 1000
    setCurrentTimeMs(seekRequestMs)
    clearSeekRequest()
  }, [seekRequestMs, clearSeekRequest, setCurrentTimeMs])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    setCurrentTimeMs(0)
    setDurationMs(0)
    setPlaying(false)
  }, [selectedAudio, setCurrentTimeMs, setDurationMs, setPlaying])

  const onNext = (): void => {
    const list = audioChildren(findDirNode(tree, parentDir(selectedAudio)))
    if (!selectedAudio || list.length === 0) return
    const idx = list.findIndex((n) => n.path === selectedAudio)
    const next = list[(idx + 1 + list.length) % list.length]
    selectAudio(next.path)
    void window.soundbox.setState({ lastAudioPath: next.path })
  }
  const onPrev = (): void => {
    const list = audioChildren(findDirNode(tree, parentDir(selectedAudio)))
    if (!selectedAudio || list.length === 0) return
    const idx = list.findIndex((n) => n.path === selectedAudio)
    const prev = list[(idx - 1 + list.length) % list.length]
    selectAudio(prev.path)
    void window.soundbox.setState({ lastAudioPath: prev.path })
  }

  return (
    <div className="flex flex-col gap-2 border-b bg-card/40 px-4 py-3">
      <audio
        ref={audioRef}
        src={selectedAudio ? pathToLocalUrl(selectedAudio) : undefined}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          onNext()
        }}
        onTimeUpdate={(e) => setCurrentTimeMs(secondsToMs(e.currentTarget.currentTime))}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration
          setDurationMs(Number.isFinite(d) ? secondsToMs(d) : 0)
        }}
        onSeeked={(e) => setCurrentTimeMs(secondsToMs(e.currentTarget.currentTime))}
      />
      <TransportControls
        audioRef={audioRef}
        selectedAudio={selectedAudio}
        onPrev={onPrev}
        onNext={onNext}
      />
    </div>
  )
}

function parentDir(path: string | null): string | null {
  if (!path) return null
  const i = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return i < 0 ? null : path.slice(0, i)
}
