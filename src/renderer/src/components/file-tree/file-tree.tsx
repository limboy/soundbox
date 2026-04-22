import { Plus, Folder } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLibrary } from '@/store/library-store'
import type { CollectionType } from '../../../../preload/soundbox'

export function FileTree(): React.JSX.Element {
  const { collections, selectedCollectionId, selectCollection, addCollection } = useLibrary()

  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<CollectionType>('Music')

  const handleCreate = (e: React.FormEvent): void => {
    e.preventDefault()
    if (!newTitle.trim()) return
    addCollection(newTitle, newType)
    setShowCreate(false)
    setNewTitle('')
    setNewType('Music')
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Collections
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setShowCreate(true)}
            title="Create Collection"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      {showCreate && (
        <div className="p-3 border-b bg-accent/30">
          <form onSubmit={handleCreate} className="flex flex-col gap-2">
            <input
              type="text"
              autoFocus
              className="px-2 py-1 text-sm bg-background border rounded"
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <select
              className="px-2 py-1 text-sm bg-background border rounded"
              value={newType}
              onChange={(e) => setNewType(e.target.value as CollectionType)}
            >
              <option value="Music">Music</option>
              <option value="Audio Book">Audio Book</option>
            </select>
            <div className="flex justify-end gap-2 mt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-6 px-2 text-xs">
                Create
              </Button>
            </div>
          </form>
        </div>
      )}

      <ScrollArea className="flex-1 p-2">
        {collections.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No collections yet. Click + to create one.
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCollection(c.id)}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors ${selectedCollectionId === c.id ? 'bg-primary/20 font-medium text-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}
              >
                <Folder className="h-4 w-4 shrink-0 opacity-70" />
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

