import { create } from 'zustand'
import type { Collection } from '../../../preload/soundbox'

type LibraryState = {
  collections: Collection[]
  selectedCollectionId: string | null
  selectedAudio: string | null
  loading: boolean
  error: string | null
  trackMeta: Record<string, { artist: string; album: string; title: string } | null>
  trackDurations: Record<string, number | null>
  setCollections: (collections: Collection[]) => void
  addCollection: (title: string) => void
  setTrackMeta: (path: string, meta: { artist: string; album: string; title: string } | null) => void
  setTrackDuration: (path: string, duration: number | null) => void
  setBulkTrackInfo: (items: Record<string, { meta?: { artist: string; album: string; title: string }; duration?: number | null }>) => void
  selectCollection: (id: string | null) => void
  addItemsToSelectedCollection: (paths: string[]) => void
  removeItemsFromSelectedCollection: (paths: string[]) => void
  selectAudio: (path: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (err: string | null) => void
}

export const useLibrary = create<LibraryState>((set, get) => ({
  collections: [],
  selectedCollectionId: null,
  selectedAudio: null,
  loading: false,
  error: null,
  trackMeta: {},
  trackDurations: {},
  setCollections: (collections) => set({ collections }),
  addCollection: (title) => {
    const id = Date.now().toString()
    const newCollection: Collection = { id, title, items: [] }
    const next = [...get().collections, newCollection]
    set({ collections: next, selectedCollectionId: id })
    void window.soundbox.setState({ collections: next, selectedCollectionId: id })
  },
  setTrackMeta: (path, meta) => set((s) => ({ trackMeta: { ...s.trackMeta, [path]: meta } })),
  setTrackDuration: (path, duration) => set((s) => ({ trackDurations: { ...s.trackDurations, [path]: duration } })),
  setBulkTrackInfo: (items) => set((s) => {
    const nextMeta = { ...s.trackMeta }
    const nextDurations = { ...s.trackDurations }
    for (const [path, info] of Object.entries(items)) {
      if (info.meta) nextMeta[path] = info.meta
      if ('duration' in info) nextDurations[path] = info.duration ?? null
    }
    return { trackMeta: nextMeta, trackDurations: nextDurations }
  }),
  selectCollection: (id) => {
    set({ selectedCollectionId: id })
    void window.soundbox.setState({ selectedCollectionId: id })
  },
  addItemsToSelectedCollection: (paths) => {
    const { collections, selectedCollectionId } = get()
    if (!selectedCollectionId) return
    const next = collections.map(c => {
      if (c.id === selectedCollectionId) {
        const set = new Set([...c.items, ...paths])
        return { ...c, items: Array.from(set) }
      }
      return c
    })
    set({ collections: next })
    void window.soundbox.setState({ collections: next })
  },
  removeItemsFromSelectedCollection: (paths) => {
    const { collections, selectedCollectionId, selectedAudio } = get()
    if (!selectedCollectionId) return
    const pathSet = new Set(paths)
    
    let nextSelectedAudio = selectedAudio
    if (selectedAudio && pathSet.has(selectedAudio)) {
      nextSelectedAudio = null
    }

    const next = collections.map(c => {
      if (c.id === selectedCollectionId) {
        return { ...c, items: c.items.filter(p => !pathSet.has(p)) }
      }
      return c
    })
    
    set({ collections: next, selectedAudio: nextSelectedAudio })
    void window.soundbox.setState({ collections: next, lastAudioPath: nextSelectedAudio })
  },
  selectAudio: (selectedAudio) => set({ selectedAudio }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))
