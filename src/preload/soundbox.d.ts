export type TreeNode =
  | { kind: 'dir'; name: string; path: string; children: TreeNode[] }
  | { kind: 'audio'; name: string; path: string }

export type Collection = {
  id: string
  title: string
  items: string[]
  watchedFolders?: string[]
  excludedPaths?: string[]
}

export type AppState = {
  collections: Collection[]
  selectedCollectionId: string | null
  lastAudioPath: string | null
}

export type LibraryChangedPayload = { kind: 'tree'; path: string }

export interface SoundboxApi {
  openFolder(): Promise<string | null>
  readTree(root: string): Promise<TreeNode>
  probeDuration(path: string): Promise<number | null>
  probeMetadata(path: string): Promise<{ artist: string; album: string; title: string } | null>
  getBulkMetadata(paths: string[]): Promise<Record<string, { meta: { artist: string; album: string; title: string }; duration: number | null }>>
  getState(): Promise<AppState>
  setState(patch: Partial<AppState>): Promise<AppState>
  onLibraryChanged(cb: (payload: LibraryChangedPayload) => void): () => void
  onStateUpdated(cb: (state: AppState) => void): () => void
  getPathInfo(path: string): Promise<{ isDirectory: boolean; isFile: boolean; ext: string } | null>
  getPathForFile(file: File): string
}

