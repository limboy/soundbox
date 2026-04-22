import { useState, useRef, useEffect } from 'react'
import { Plus, Folder, Pencil, Trash2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { useLibrary } from '@/store/library-store'
import { usePlayer } from '@/store/player-store'

export function FileTree(): React.JSX.Element {
  const {
    collections,
    selectedCollectionId,
    selectCollection,
    addCollection,
    updateCollectionTitle,
    deleteCollection
  } = useLibrary()
  const setPlaying = usePlayer((s) => s.setPlaying)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const handleAddDefault = (): void => {
    const baseName = 'New Collection'
    let title = baseName
    let counter = 1

    while (collections.some((c) => c.title === title)) {
      title = `${baseName} ${++counter}`
    }

    const id = addCollection(title)
    setEditingId(id)
    setEditingTitle(title)
    setPlaying(false)
  }

  const handleRename = (id: string, title: string): void => {
    const trimmed = title.trim()
    if (trimmed) {
      updateCollectionTitle(id, trimmed)
    }
    setEditingId(null)
  }

  const handleDelete = (id: string, title: string): void => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteCollection(id)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <ScrollArea className="flex-1 p-2">
        {collections.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No collections yet.</div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {collections.map((c) => (
              <div key={c.id}>
                {editingId === c.id ? (
                  <div className="flex items-center gap-2 rounded-md px-2 py-1 bg-accent/50">
                    <Folder className="h-4 w-4 shrink-0 opacity-70" />
                    <input
                      ref={inputRef}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleRename(c.id, editingTitle)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(c.id, editingTitle)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                ) : (
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <button
                        onClick={() => selectCollection(c.id)}
                        onDoubleClick={() => {
                          setEditingId(c.id)
                          setEditingTitle(c.title)
                        }}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors ${selectedCollectionId === c.id ? 'bg-primary/20 font-medium text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}
                      >
                        <Folder className="h-4 w-4 shrink-0 opacity-70" />
                        <span className="truncate">{c.title}</span>
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => {
                          setEditingId(c.id)
                          setEditingTitle(c.title)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename
                      </ContextMenuItem>
                      <ContextMenuItem variant="destructive" onClick={() => handleDelete(c.id, c.title)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="mt-auto border-t">
        <button
          onClick={handleAddDefault}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Collection</span>
        </button>
      </div>
    </div>
  )
}

