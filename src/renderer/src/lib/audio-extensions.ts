export function audioFormat(name: string): string {
  const i = name.lastIndexOf('.')
  if (i < 0) return ''
  return name.slice(i + 1).toLowerCase()
}

export function basename(path: string): string {
  const i = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return i < 0 ? path : path.slice(i + 1)
}

export function dirname(path: string): string {
  const i = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return i < 0 ? '' : path.slice(0, i)
}

export function pathToLocalUrl(absPath: string): string {
  let normalized = absPath.replaceAll('\\', '/')
  if (!normalized.startsWith('/')) normalized = '/' + normalized
  return `local://${encodeURI(normalized)}`
}
