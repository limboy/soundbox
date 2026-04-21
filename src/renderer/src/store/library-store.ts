import { create } from 'zustand'
import type { TreeNode } from '../../../preload/soundbox'

type DirNode = Extract<TreeNode, { kind: 'dir' }>
type AudioNode = Extract<TreeNode, { kind: 'audio' }>

type LibraryState = {
  rootFolder: string | null
  tree: TreeNode | null
  selectedFolder: string | null
  selectedAudio: string | null
  loading: boolean
  error: string | null
  setRoot: (root: string | null) => void
  setTree: (tree: TreeNode | null) => void
  selectFolder: (path: string | null) => void
  selectAudio: (path: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (err: string | null) => void
}

export const useLibrary = create<LibraryState>((set) => ({
  rootFolder: null,
  tree: null,
  selectedFolder: null,
  selectedAudio: null,
  loading: false,
  error: null,
  setRoot: (rootFolder) =>
    set({
      rootFolder,
      selectedFolder: rootFolder,
      selectedAudio: null,
      tree: null
    }),
  setTree: (tree) => set({ tree }),
  selectFolder: (selectedFolder) => set({ selectedFolder }),
  selectAudio: (selectedAudio) => set({ selectedAudio }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}))

export function findDirNode(tree: TreeNode | null, path: string | null): DirNode | null {
  if (!tree || !path) return null
  if (tree.kind !== 'dir') return null
  if (tree.path === path) return tree
  for (const child of tree.children) {
    if (child.kind === 'dir') {
      const hit = findDirNode(child, path)
      if (hit) return hit
    }
  }
  return null
}

export function audioChildren(dir: DirNode | null): AudioNode[] {
  if (!dir) return []
  return dir.children.filter((c): c is AudioNode => c.kind === 'audio')
}

export function flatAudioList(tree: TreeNode | null): AudioNode[] {
  if (!tree) return []
  const out: AudioNode[] = []
  const visit = (n: TreeNode): void => {
    if (n.kind === 'audio') out.push(n)
    else n.children.forEach(visit)
  }
  visit(tree)
  return out
}
