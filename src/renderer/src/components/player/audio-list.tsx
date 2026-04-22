import { FileAudio, Play, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
  VisibilityState
} from '@tanstack/react-table'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { basename } from '@/lib/audio-extensions'
import { msToClock } from '@/lib/format-time'
import { cn } from '@/lib/utils'
import { useLibrary } from '@/store/library-store'
import { usePlayer } from '@/store/player-store'

type AudioItem = {
  path: string
  title: string
  artist: string
  album: string
  duration: number | null
  index: number
}

export function AudioList(): React.JSX.Element {
  const collections = useLibrary((s) => s.collections)
  const selectedCollectionId = useLibrary((s) => s.selectedCollectionId)
  const selectedAudio = useLibrary((s) => s.selectedAudio)
  const selectAudio = useLibrary((s) => s.selectAudio)
  const addItemsToSelectedCollection = useLibrary((s) => s.addItemsToSelectedCollection)
  const setPlaying = usePlayer((s) => s.setPlaying)

  const [isDragOver, setIsDragOver] = useState(false)
  const trackMeta = useLibrary((s) => s.trackMeta)
  const trackDurations = useLibrary((s) => s.trackDurations)
  const setTrackMeta = useLibrary((s) => s.setTrackMeta)
  const setTrackDuration = useLibrary((s) => s.setTrackDuration)
  const setBulkTrackInfo = useLibrary((s) => s.setBulkTrackInfo)


  const [sorting, setSorting] = useState<SortingState>([{ id: 'title', desc: false }])
  const [columnSizing, setColumnSizing] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const activeCollection = collections.find((c) => c.id === selectedCollectionId)
  const rows = useMemo(() => (activeCollection ? activeCollection.items : []), [activeCollection])

  useEffect(() => {
    let cancelled = false

    const checkAll = async (): Promise<void> => {
      const pathsToCheck = [...rows]
      if (pathsToCheck.length === 0) return

      // First, get everything we can from the bulk cache
      const bulk = await window.soundbox.getBulkMetadata(pathsToCheck).catch(() => ({}))
      if (cancelled) return

      setBulkTrackInfo(bulk)

      for (const p of pathsToCheck) {
        if (cancelled) return

        const info = await window.soundbox.getPathInfo(p).catch(() => null)
        if (!info) continue

        if (!(p in trackDurations) && !bulk[p]) {
          const d = await window.soundbox.probeDuration(p).catch(() => null)
          if (cancelled) return
          setTrackDuration(p, d)
        }

        if (!(p in trackMeta) && !bulk[p]) {
          const m = await window.soundbox.probeMetadata(p).catch(() => null)
          if (cancelled) return
          setTrackMeta(p, m || { artist: 'Unknown', album: 'Unknown', title: basename(p) })
        }
      }
    }



    void checkAll()

    const handleFocus = (): void => {
      void checkAll()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      cancelled = true
      window.removeEventListener('focus', handleFocus)
    }
  }, [
    rows,
    setBulkTrackInfo,
    setTrackDuration,
    setTrackMeta,
    trackDurations,
    trackMeta
  ])

  const data = useMemo<AudioItem[]>(() => {
    return rows.map((path, index) => {
      const m = trackMeta[path]
      const duration = trackDurations[path] ?? null
      return {
        path,
        index: index + 1,
        title: m?.title && m.title !== 'Unknown' ? m.title : basename(path),
        artist: m?.artist || 'Unknown',
        album: m?.album || 'Unknown',
        duration
      }
    })
  }, [rows, trackMeta, trackDurations])

  const columns = useMemo<ColumnDef<AudioItem>[]>(() => {
    const cols: ColumnDef<AudioItem>[] = [
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors w-full"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />
            )}
          </button>
        ),
        cell: (info) => {
          const path = info.row.original.path
          const active = path === selectedAudio
          return (
            <div className="flex items-center gap-2">
              {active && <Play className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
              <span className={cn('truncate', active && 'text-primary font-medium')}>
                {info.getValue() as string}
              </span>
            </div>
          )
        },
        sortingFn: (rowA, rowB, columnId) => {
          const a = rowA.getValue(columnId) as string
          const b = rowB.getValue(columnId) as string
          return a.localeCompare(b, undefined, { 
            numeric: true, 
            sensitivity: 'base',
            usage: 'sort' 
          })
        },
        size: 250,
        minSize: 100,
        enableHiding: false
      },
      {
        accessorKey: 'artist',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors w-full"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Artist
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />
            )}
          </button>
        ),
        size: 150,
        minSize: 80
      },
      {
        accessorKey: 'album',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors w-full"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Album
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />
            )}
          </button>
        ),
        size: 150,
        minSize: 80
      },
      {
        accessorKey: 'duration',
        header: ({ column }) => (
          <div className="text-right w-full pr-2">
            <button
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Duration
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="h-3.5 w-3.5" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />
              )}
            </button>
          </div>
        ),
        cell: (info) => (
          <div className="text-right tabular-nums text-muted-foreground pr-2">
            {msToClock(info.getValue() as number | null)}
          </div>
        ),
        size: 90,
        minSize: 80
      }
    ]

    return cols
  }, [selectedAudio])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnSizing,
      columnVisibility
    },
    onSortingChange: setSorting,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

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
    const folderPaths: string[] = []
    for (const file of files) {
      const p = window.soundbox.getPathForFile(file)
      if (!p) continue
      const info = await window.soundbox.getPathInfo(p)
      if (!info) continue
      if (info.isFile) {
        const allowed = ['.mp3', '.m4a', '.m4b', '.flac']
        if (allowed.includes(info.ext)) paths.push(p)
      } else if (info.isDirectory) {
        folderPaths.push(p)
        const tree = await window.soundbox.readTree(p)
        const flatten = (n: import('../../../../preload/soundbox').TreeNode): void => {
          if (n.kind === 'audio') paths.push(n.path)
          if (n.kind === 'dir') n.children.forEach(flatten)
        }
        flatten(tree)
      }
    }
    if (paths.length > 0) addItemsToSelectedCollection(paths)
    if (folderPaths.length > 0) useLibrary.getState().addFoldersToSelectedCollection(folderPaths)
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
        className={cn(
          'flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground transition-colors',
          isDragOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/20' : ''
        )}
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
    <div
      className={cn('w-full', isDragOver ? 'bg-primary/5 ring-2 ring-inset ring-primary/20' : '')}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Table className="min-w-full table-fixed border-collapse">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <TableHeader className="sticky top-33.5 z-20 bg-muted/50 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="group whitespace-nowrap relative last:border-0 hover:border-border/30 transition-colors"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}

                      {/* Bottom Border */}
                      <div className="absolute inset-x-0 bottom-0 h-px bg-border z-30 pointer-events-none" />

                      {header.column.getCanResize() && !header.column.getIsLastColumn() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            'absolute top-0 bottom-0 -right-1.5 w-3 cursor-col-resize select-none touch-none z-20 group/resizer bg-transparent',
                            header.column.getIsResizing() ? '' : ''
                          )}
                        >
                          <div
                            className={cn(
                              'absolute top-2 bottom-2 right-[5.5px] w-px bg-border transition-colors',
                              header.column.getIsResizing()
                                ? 'bg-primary w-0.5'
                                : 'group-hover/resizer:bg-primary/50'
                            )}
                          />
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-48">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <ContextMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </ContextMenuCheckboxItem>
                )
              })}
          </ContextMenuContent>
        </ContextMenu>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const active = row.original.path === selectedAudio
            return (
              <TableRow
                key={row.id}
                onClick={() => {
                  selectAudio(row.original.path)
                  void window.soundbox.setState({ lastAudioPath: row.original.path })
                }}
                onDoubleClick={() => {
                  selectAudio(row.original.path)
                  void window.soundbox.setState({ lastAudioPath: row.original.path })
                  setPlaying(true)
                }}
                className={cn('cursor-pointer group', active && 'bg-accent/60')}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                    <div className="truncate">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
