import { FolderOpen, RefreshCw } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLibrary } from '@/store/library-store'
import { TreeNodeView } from './tree-node'

export function FileTree(): React.JSX.Element {
  const {
    rootFolder,
    tree,
    selectedFolder,
    selectedAudio,
    loading,
    error,
    setRoot,
    setTree,
    selectFolder,
    selectAudio,
    setLoading,
    setError
  } = useLibrary()

  const refresh = useCallback(
    async (root: string) => {
      setLoading(true)
      setError(null)
      try {
        const t = await window.soundbox.readTree(root)
        setTree(t)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setError, setTree]
  )

  useEffect(() => {
    if (rootFolder) void refresh(rootFolder)
    else setTree(null)
  }, [rootFolder, refresh, setTree])

  useEffect(() => {
    const off = window.soundbox.onLibraryChanged(({ kind }) => {
      if (kind === 'tree' && rootFolder) void refresh(rootFolder)
    })
    return off
  }, [rootFolder, refresh])

  const handlePick = async (): Promise<void> => {
    const picked = await window.soundbox.openFolder()
    if (!picked) return
    setRoot(picked)
    await window.soundbox.setState({ rootFolder: picked, lastAudioPath: null })
  }

  return (
    <div className="flex h-full flex-col border-r">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {rootFolder ? rootFolder.split(/[/\\]/).pop() : 'No folder'}
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            disabled={!rootFolder || loading}
            onClick={() => rootFolder && refresh(rootFolder)}
            title="Refresh"
          >
            <RefreshCw className={loading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handlePick}
            title="Open folder"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        {!rootFolder && (
          <div className="p-4 text-sm text-muted-foreground">
            <Button onClick={handlePick} variant="outline" className="w-full">
              <FolderOpen className="h-4 w-4" />
              Open folder
            </Button>
          </div>
        )}
        {rootFolder && error && (
          <div className="p-4 text-sm text-destructive">{error}</div>
        )}
        {rootFolder && tree && (
          <div className="p-1.5">
            <TreeNodeView
              node={tree}
              depth={0}
              defaultExpanded
              selectedAudio={selectedAudio}
              selectedFolder={selectedFolder}
              onSelectFolder={selectFolder}
              onSelectAudio={(p) => {
                selectAudio(p)
                void window.soundbox.setState({ lastAudioPath: p })
              }}
            />
          </div>
        )}
        {rootFolder && !tree && !error && (
          <div className="p-4 text-sm text-muted-foreground">Loading…</div>
        )}
      </ScrollArea>
    </div>
  )
}
