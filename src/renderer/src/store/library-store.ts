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
  addCollection: (title: string) => string
  updateCollectionTitle: (id: string, title: string) => void
  deleteCollection: (id: string) => void
  setTrackMeta: (path: string, meta: { artist: string; album: string; title: string } | null) => void
  setTrackDuration: (path: string, duration: number | null) => void
  setBulkTrackInfo: (items: Record<string, { meta?: { artist: string; album: string; title: string }; duration?: number | null }>) => void
  selectCollection: (id: string | null) => void
  addItemsToSelectedCollection: (paths: string[]) => void
  removeItemsFromSelectedCollection: (paths: string[]) => void
  addFoldersToSelectedCollection: (paths: string[]) => void
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
    set({ collections: next, selectedCollectionId: id, selectedAudio: null })
    void window.soundbox.setState({ collections: next, selectedCollectionId: id, lastAudioPath: null })
    return id
  },
  updateCollectionTitle: (id, title) => {
    const next = get().collections.map((c) => (c.id === id ? { ...c, title } : c))
    set({ collections: next })
    void window.soundbox.setState({ collections: next })
  },
  deleteCollection: (id) => {
    const { collections, selectedCollectionId } = get()
    const next = collections.filter((c) => c.id !== id)
    let nextSelectedId = selectedCollectionId
    let nextSelectedAudio = get().selectedAudio

    if (selectedCollectionId === id) {
      nextSelectedId = next.length > 0 ? next[0].id : null
      nextSelectedAudio = next.length > 0 ? next[0].items?.[0] || null : null
    }

    set({ collections: next, selectedCollectionId: nextSelectedId, selectedAudio: nextSelectedAudio })
    void window.soundbox.setState({
      collections: next,
      selectedCollectionId: nextSelectedId,
      lastAudioPath: nextSelectedAudio
    })
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
    const { collections, selectedCollectionId } = get()
    if (selectedCollectionId === id) return

    const collection = collections.find((c) => c.id === id)
    const firstAudio = collection?.items?.[0] || null

    set({ selectedCollectionId: id, selectedAudio: firstAudio })
    void window.soundbox.setState({ selectedCollectionId: id, lastAudioPath: firstAudio })
  },
  addItemsToSelectedCollection: (paths) => {
    const { collections, selectedCollectionId } = get()
    if (!selectedCollectionId) return
    const pathSet = new Set(paths)
    const next = collections.map(c => {
      if (c.id === selectedCollectionId) {
        const items = Array.from(new Set([...c.items, ...paths]))
        const excludedPaths = (c.excludedPaths || []).filter(p => !pathSet.has(p))
        return { ...c, items, excludedPaths }
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
        const items = c.items.filter(p => !pathSet.has(p))
        const excludedPaths = Array.from(new Set([...(c.excludedPaths || []), ...paths]))
        return { ...c, items, excludedPaths }
      }
      return c
    })

    set({ collections: next, selectedAudio: nextSelectedAudio })
    void window.soundbox.setState({ collections: next, lastAudioPath: nextSelectedAudio })
  },
  addFoldersToSelectedCollection: (paths) => {
    const { collections, selectedCollectionId } = get()
    if (!selectedCollectionId) return
    const next = collections.map(c => {
      if (c.id === selectedCollectionId) {
        const folders = new Set([...(c.watchedFolders || []), ...paths])
        return { ...c, watchedFolders: Array.from(folders) }
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
