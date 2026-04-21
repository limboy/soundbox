import { FileAudio, Play } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { audioFormat } from '@/lib/audio-extensions'
import { msToClock } from '@/lib/format-time'
import { cn } from '@/lib/utils'
import {
  audioChildren,
  findDirNode,
  flatAudioList,
  useLibrary
} from '@/store/library-store'

export function AudioList(): React.JSX.Element {
  const tree = useLibrary((s) => s.tree)
  const selectedFolder = useLibrary((s) => s.selectedFolder)
  const selectedAudio = useLibrary((s) => s.selectedAudio)
  const selectAudio = useLibrary((s) => s.selectAudio)

  const rows = useMemo(() => {
    const dir = findDirNode(tree, selectedFolder)
    if (dir) {
      const direct = audioChildren(dir)
      if (direct.length > 0) return direct
      return flatAudioList(dir)
    }
    return flatAudioList(tree)
  }, [tree, selectedFolder])

  const [durations, setDurations] = useState<Record<string, number | null>>({})

  useEffect(() => {
    let cancelled = false
    const paths = rows.map((r) => r.path).filter((p) => !(p in durations))
    ;(async () => {
      for (const p of paths) {
        if (cancelled) return
        const ms = await window.soundbox.probeDuration(p).catch(() => null)
        if (cancelled) return
        setDurations((d) => ({ ...d, [p]: ms }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [rows, durations])

  if (rows.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
        <div>
          <FileAudio className="mx-auto h-8 w-8 opacity-30" />
          <p className="mt-2">No audio files in this folder.</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-24">Format</TableHead>
            <TableHead className="w-24 text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => {
            const active = row.path === selectedAudio
            const ms = durations[row.path]
            return (
              <TableRow
                key={row.path}
                onClick={() => {
                  selectAudio(row.path)
                  void window.soundbox.setState({ lastAudioPath: row.path })
                }}
                onDoubleClick={() => {
                  selectAudio(row.path)
                  void window.soundbox.setState({ lastAudioPath: row.path })
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
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="uppercase text-muted-foreground">
                  {audioFormat(row.name)}
                </TableCell>
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
