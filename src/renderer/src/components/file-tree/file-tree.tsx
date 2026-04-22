import { Plus, Folder } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLibrary } from '@/store/library-store'

export function FileTree(): React.JSX.Element {
  const { collections, selectedCollectionId, selectCollection, addCollection } = useLibrary()

  const handleAddDefault = (): void => {
    const baseName = 'New Collection'
    let title = baseName
    let counter = 1
    
    while (collections.some(c => c.title === title)) {
      title = `${baseName} ${++counter}`
    }
    
    addCollection(title)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <ScrollArea className="flex-1 p-2">
        {collections.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No collections yet.
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

