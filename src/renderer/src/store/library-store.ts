import { create } from 'zustand'
import type { Collection, CollectionType } from '../../../preload/soundbox'

type LibraryState = {
  collections: Collection[]
  selectedCollectionId: string | null
  selectedAudio: string | null
  loading: boolean
  error: string | null
  trackMeta: Record<string, { artist: string; album: string; title: string } | null>
  trackDurations: Record<string, number | null>
  setCollections: (collections: Collection[]) => void
  addCollection: (title: string, type: CollectionType) => void
  setTrackMeta: (path: string, meta: { artist: string; album: string; title: string } | null) => void
  setTrackDuration: (path: string, duration: number | null) => void
  selectCollection: (id: string | null) => void
  addItemsToSelectedCollection: (paths: string[]) => void
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
  addCollection: (title, type) => {
    const id = Date.now().toString()
    const newCollection: Collection = { id, title, type, items: [] }
    const next = [...get().collections, newCollection]
    set({ collections: next, selectedCollectionId: id })
    void window.soundbox.setState({ collections: next, selectedCollectionId: id })
  },
  setTrackMeta: (path, meta) => set((s) => ({ trackMeta: { ...s.trackMeta, [path]: meta } })),
  setTrackDuration: (path, duration) => set((s) => ({ trackDurations: { ...s.trackDurations, [path]: duration } })),
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
  selectAudio: (selectedAudio) => set({ selectedAudio }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))
