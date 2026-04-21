import { FileText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { basename } from '@/lib/audio-extensions'
import { useLibrary } from '@/store/library-store'
import type { Companion } from '../../../../preload/soundbox'
import { HtmlView } from './html-view'
import { LrcView } from './lrc-view'
import { MarkdownView } from './markdown-view'
import { SrtView } from './srt-view'
import { TextView } from './text-view'

export function SidecarPanel(): React.JSX.Element {
  const selectedAudio = useLibrary((s) => s.selectedAudio)
  const [companions, setCompanions] = useState<Companion[]>([])
  const [content, setContent] = useState<Record<string, string>>({})
  const [active, setActive] = useState<string | null>(null)
  const reqId = useRef(0)

  useEffect(() => {
    reqId.current += 1
    const myReq = reqId.current
    setCompanions([])
    setContent({})
    setActive(null)
    if (!selectedAudio) return
    void (async () => {
      const list = await window.soundbox.findCompanions(selectedAudio).catch(() => [])
      if (reqId.current !== myReq) return
      setCompanions(list)
      if (list[0]) setActive(list[0].path)
      const loaded: Record<string, string> = {}
      for (const c of list) {
        try {
          loaded[c.path] = await window.soundbox.readText(c.path)
        } catch {
          loaded[c.path] = ''
        }
        if (reqId.current !== myReq) return
      }
      setContent(loaded)
    })()
  }, [selectedAudio])

  useEffect(() => {
    const off = window.soundbox.onLibraryChanged(async ({ kind, path }) => {
      if (kind !== 'text') return
      if (!companions.find((c) => c.path === path)) return
      try {
        const text = await window.soundbox.readText(path)
        setContent((m) => ({ ...m, [path]: text }))
      } catch {
        /* ignore */
      }
    })
    return off
  }, [companions])

  let inner: React.JSX.Element
  if (!selectedAudio) {
    inner = <EmptyState label="Select an audio file to view its text." />
  } else if (companions.length === 0) {
    inner = <EmptyState label="No companion text files alongside this audio." />
  } else {
    inner = (
      <Tabs
        value={active ?? companions[0].path}
        onValueChange={setActive}
        className="flex h-full min-h-0 flex-col"
      >
        <TabsList className="mx-2 mt-2 inline-flex h-auto flex-wrap gap-1 bg-transparent p-0">
          {companions.map((c) => (
            <TabsTrigger
              key={c.path}
              value={c.path}
              className="h-7 px-2 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              {basename(c.path)}
            </TabsTrigger>
          ))}
        </TabsList>
        {companions.map((c) => (
          <TabsContent
            key={c.path}
            value={c.path}
            className="mt-0 flex-1 overflow-hidden"
          >
            <Renderer ext={c.ext} content={content[c.path] ?? ''} />
          </TabsContent>
        ))}
      </Tabs>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-l">
      {inner}
    </div>
  )
}

function Renderer({ ext, content }: { ext: string; content: string }): React.JSX.Element {
  switch (ext) {
    case '.lrc':
      return <LrcView content={content} />
    case '.srt':
    case '.vtt':
      return <SrtView content={content} />
    case '.md':
    case '.markdown':
      return <MarkdownView content={content} />
    case '.html':
    case '.htm':
      return <HtmlView content={content} />
    default:
      return <TextView content={content} />
  }
}

function EmptyState({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
      <div>
        <FileText className="mx-auto h-8 w-8 opacity-30" />
        <p className="mt-2">{label}</p>
      </div>
    </div>
  )
}
