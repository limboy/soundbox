export type TreeNode =
  | { kind: 'dir'; name: string; path: string; children: TreeNode[] }
  | { kind: 'audio'; name: string; path: string }

export type AppState = {
  rootFolder: string | null
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
  getState(): Promise<AppState>
  setState(patch: Partial<AppState>): Promise<AppState>
  onLibraryChanged(cb: (payload: LibraryChangedPayload) => void): () => void
  getPathInfo(path: string): Promise<{ isDirectory: boolean; isFile: boolean; ext: string } | null>
  getPathForFile(file: File): string
}
