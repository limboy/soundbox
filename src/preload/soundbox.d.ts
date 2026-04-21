export type TreeNode =
  | { kind: 'dir'; name: string; path: string; children: TreeNode[] }
  | { kind: 'audio'; name: string; path: string }

export type CollectionType = 'Music' | 'Audio Book'
export type Collection = {
  id: string
  title: string
  type: CollectionType
  items: string[]
}

export type AppState = {
  rootFolder: string | null
  collections: Collection[]
  selectedCollectionId: string | null
  lastAudioPath: string | null
}

export type Companion = { ext: string; path: string }

export type LibraryChangedPayload = { kind: 'tree' | 'text'; path: string }

export interface SoundboxApi {
  openFolder(): Promise<string | null>
  readTree(root: string): Promise<TreeNode>
  readText(path: string): Promise<string>
  findCompanions(audioPath: string): Promise<Companion[]>
  probeDuration(path: string): Promise<number | null>
  probeMetadata(path: string): Promise<{ artist: string; album: string; title: string } | null>
  fetchAndCacheLyrics(path: string, trackName: string, artistName: string, albumName: string, duration: number): Promise<string | null>
  getState(): Promise<AppState>
  setState(patch: Partial<AppState>): Promise<AppState>
  onLibraryChanged(cb: (payload: LibraryChangedPayload) => void): () => void
  getPathInfo(path: string): Promise<{ isDirectory: boolean; isFile: boolean; ext: string } | null>
  getPathForFile(file: File): string
}
