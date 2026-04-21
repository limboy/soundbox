import { resolve, sep } from 'node:path'

export function normalizeAbsolute(p: string): string {
  return resolve(p)
}

export function isInsideRoot(root: string, target: string): boolean {
  const r = resolve(root)
  const t = resolve(target)
  const isCaseInsensitive = process.platform !== 'linux'

  if (isCaseInsensitive) {
    if (t.toLowerCase() === r.toLowerCase()) return true
    const prefix = (r.endsWith(sep) ? r : r + sep).toLowerCase()
    return t.toLowerCase().startsWith(prefix)
  }

  if (t === r) return true
  const prefix = r.endsWith(sep) ? r : r + sep
  return t.startsWith(prefix)
}
