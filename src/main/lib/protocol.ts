import { net, protocol } from 'electron'
import { pathToFileURL } from 'node:url'
import { isInsideRoot } from './paths'

export const LOCAL_SCHEME = 'local'

export function registerLocalSchemePrivileged(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: LOCAL_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        corsEnabled: true
      }
    }
  ])
}

export function registerLocalProtocolHandler(getRoot: () => string | null): void {
  protocol.handle(LOCAL_SCHEME, (request) => {
    const root = getRoot()
    if (!root) {
      return new Response('No root folder selected', { status: 403 })
    }
    let absPath: string
    try {
      const url = new URL(request.url)
      let raw = decodeURIComponent(url.pathname)
      if (process.platform === 'win32' && /^\/[A-Za-z]:/.test(raw)) {
        raw = raw.slice(1)
      }
      absPath = raw
    } catch {
      return new Response('Bad URL', { status: 400 })
    }
    if (!isInsideRoot(root, absPath)) {
      return new Response('Forbidden', { status: 403 })
    }
    return net.fetch(pathToFileURL(absPath).toString())
  })
}
