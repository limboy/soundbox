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

  const isPlaying = usePlayer((s) => s.isPlaying)
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

  const shuffle = usePlayer((s) => s.shuffle)
  const loopMode = usePlayer((s) => s.loopMode)

  const onNext = (): void => {
    const list = audioChildren(findDirNode(tree, parentDir(selectedAudio)))
    if (!selectedAudio || list.length === 0) return
    const idx = list.findIndex((n) => n.path === selectedAudio)
    
    let nextIdx: number
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * list.length)
      // Try to avoid the same song if list > 1
      if (nextIdx === idx && list.length > 1) {
        nextIdx = (nextIdx + 1) % list.length
      }
    } else {
      nextIdx = (idx + 1) % list.length
    }
    
    const next = list[nextIdx]
    selectAudio(next.path)
    void window.soundbox.setState({ lastAudioPath: next.path })
  }

  const onPrev = (): void => {
    const list = audioChildren(findDirNode(tree, parentDir(selectedAudio)))
    if (!selectedAudio || list.length === 0) return
    const idx = list.findIndex((n) => n.path === selectedAudio)
    
    let prevIdx: number
    if (shuffle) {
      prevIdx = Math.floor(Math.random() * list.length)
      if (prevIdx === idx && list.length > 1) {
        prevIdx = (prevIdx + 1) % list.length
      }
    } else {
      prevIdx = (idx - 1 + list.length) % list.length
    }
    
    const prev = list[prevIdx]
    selectAudio(prev.path)
    void window.soundbox.setState({ lastAudioPath: prev.path })
  }

  return (
    <div className="flex flex-col gap-2 border-b bg-background px-4 py-4">
      <audio
        ref={audioRef}
        src={selectedAudio ? pathToLocalUrl(selectedAudio) : undefined}
        preload="metadata"
        autoPlay={isPlaying}
        onPlay={() => {
          console.log('[AudioPlayer] play')
          setPlaying(true)
        }}
        onPause={() => {
          console.log('[AudioPlayer] pause')
          setPlaying(false)
        }}
        onEnded={() => {
          console.log('[AudioPlayer] ended')
          if (loopMode === 'one') {
            const a = audioRef.current
            if (a) {
              a.currentTime = 0
              a.play().catch(console.error)
            }
          } else if (loopMode === 'all' || !shuffle) {
            onNext()
          } else {
            // Case for shuffle but loop off? Usually shuffle implies some form of repeat or just stops.
            // Many players continue to next shuffle even if loop is off.
            onNext()
          }
        }}
        onError={(e) => {
          const err = e.currentTarget.error
          console.error('[AudioPlayer] error:', {
            code: err?.code,
            message: err?.message,
            src: e.currentTarget.src
          })
        }}
        onLoadStart={() => console.log('[AudioPlayer] loadstart', selectedAudio)}
        onLoadedMetadata={() => console.log('[AudioPlayer] loadedmetadata')}
        onCanPlay={() => {
          console.log('[AudioPlayer] canplay')
          if (isPlaying) {
            audioRef.current?.play().catch(console.error)
          }
        }}
        onTimeUpdate={(e) => setCurrentTimeMs(secondsToMs(e.currentTarget.currentTime))}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration
          console.log('[AudioPlayer] durationchange:', d)
          setDurationMs(Number.isFinite(d) ? secondsToMs(d) : 0)
        }}
        onSeeked={(e) => {
          console.log('[AudioPlayer] seeked:', e.currentTarget.currentTime)
          setCurrentTimeMs(secondsToMs(e.currentTarget.currentTime))
        }}
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
