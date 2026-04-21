import { FileAudio, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { basename } from '@/lib/audio-extensions'
import { msToClock } from '@/lib/format-time'
import { cn } from '@/lib/utils'
import { useLibrary } from '@/store/library-store'

type Meta = { artist: string; album: string; title: string }

export function AudioList(): React.JSX.Element {
  const collections = useLibrary((s) => s.collections)
  const selectedCollectionId = useLibrary((s) => s.selectedCollectionId)
  const selectedAudio = useLibrary((s) => s.selectedAudio)
  const selectAudio = useLibrary((s) => s.selectAudio)
  const addItemsToSelectedCollection = useLibrary((s) => s.addItemsToSelectedCollection)

  const [isDragOver, setIsDragOver] = useState(false)
  const trackMeta = useLibrary((s) => s.trackMeta)
  const trackDurations = useLibrary((s) => s.trackDurations)
  const setTrackMeta = useLibrary((s) => s.setTrackMeta)
  const setTrackDuration = useLibrary((s) => s.setTrackDuration)

  const activeCollection = collections.find(c => c.id === selectedCollectionId)
  const rows = activeCollection ? activeCollection.items : []
  const isMusic = activeCollection?.type === 'Music'

  useEffect(() => {
    let cancelled = false
    const pathsToProbe = rows.filter((p) => {
      const hasDuration = p in trackDurations
      const hasMeta = !isMusic || p in trackMeta
      return !hasDuration || !hasMeta
    })

    if (pathsToProbe.length === 0) return

    ;(async () => {
      for (const p of pathsToProbe) {
        if (cancelled) return
        
        let d = trackDurations[p]
        if (!(p in trackDurations)) {
          d = await window.soundbox.probeDuration(p).catch(() => null)
          if (cancelled) return
          setTrackDuration(p, d)
        }

        if (isMusic && !(p in trackMeta)) {
          const m = await window.soundbox.probeMetadata(p).catch(() => null)
          if (cancelled) return
          setTrackMeta(p, m || { artist: 'Unknown', album: 'Unknown', title: basename(p) })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [rows, isMusic]) // Removed durations from dependencies to avoid self-canceling loop


  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    if (activeCollection) setIsDragOver(true)
  }
  const handleDragLeave = (): void => setIsDragOver(false)
  const handleDrop = async (e: React.DragEvent): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (!activeCollection) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const paths: string[] = []
    for (const file of files) {
      const p = window.soundbox.getPathForFile(file)
      if (!p) continue
      const info = await window.soundbox.getPathInfo(p)
      if (!info) continue
      if (info.isFile) {
        const allowed = ['.mp3', '.m4a', '.m4b', '.flac']
        if (allowed.includes(info.ext)) paths.push(p)
      } else if (info.isDirectory) {
        const tree = await window.soundbox.readTree(p)
        const flatten = (n: any) => {
          if (n.kind === 'audio') paths.push(n.path)
          if (n.children) n.children.forEach(flatten)
        }
        flatten(tree)
      }
    }
    if (paths.length > 0) addItemsToSelectedCollection(paths)
  }

  if (!activeCollection) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        <div>
          <FileAudio className="mx-auto h-8 w-8 opacity-30" />
          <p className="mt-2">Select or create a collection.</p>
        </div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div 
        className={cn("flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground transition-colors", isDragOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/20' : '')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div>
          <FileAudio className="mx-auto h-8 w-8 opacity-30" />
          <p className="mt-2">Drag and drop audio files here.</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea 
      className={cn("flex-1", isDragOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/20' : '')}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Table className="min-w-[400px]">
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Name</TableHead>
            {isMusic && <TableHead>Artist</TableHead>}
            {isMusic && <TableHead>Album</TableHead>}
            <TableHead className="w-24 text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const active = row === selectedAudio
            const ms = trackDurations[row]
            const m = trackMeta[row]
            const name = m?.title && m.title !== 'Unknown' ? m.title : basename(row)
            return (
              <TableRow
                key={row}
                onClick={() => {
                  selectAudio(row)
                  void window.soundbox.setState({ lastAudioPath: row })
                }}
                onDoubleClick={() => {
                  selectAudio(row)
                  void window.soundbox.setState({ lastAudioPath: row })
                }}
                className={cn('cursor-pointer', active && 'bg-accent/60')}
              >
                <TableCell className="text-muted-foreground tabular-nums">
                  {active ? (
                    <Play className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">{name}</TableCell>
                {isMusic && <TableCell className="text-muted-foreground">{m?.artist || 'Unknown'}</TableCell>}
                {isMusic && <TableCell className="text-muted-foreground">{m?.album || 'Unknown'}</TableCell>}
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {msToClock(ms ?? null)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
