import { useCallback, useEffect, useRef, useState } from 'react'
import type { PanelImperativeHandle } from 'react-resizable-panels'
import {
  PanelLeft,
  PanelRight
} from 'lucide-react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileTree } from '@/components/file-tree/file-tree'
import { AudioList } from '@/components/player/audio-list'
import { AudioPlayer } from '@/components/player/audio-player'
import { SidecarPanel } from '@/components/sidecar/sidecar-panel'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useLibrary } from '@/store/library-store'
import { useUI } from '@/store/ui-store'

export function PlayerRoute(): React.JSX.Element {
  const setCollections = useLibrary((s) => s.setCollections)
  const selectCollection = useLibrary((s) => s.selectCollection)
  const selectAudio = useLibrary((s) => s.selectAudio)

  const leftPanelRef = useRef<PanelImperativeHandle>(null)
  const rightPanelRef = useRef<PanelImperativeHandle>(null)

  const leftSidebarOpen = useUI((s) => s.leftSidebarOpen)
  const rightSidebarOpen = useUI((s) => s.rightSidebarOpen)
  const setLeftSidebarOpen = useUI((s) => s.setLeftSidebarOpen)
  const setRightSidebarOpen = useUI((s) => s.setRightSidebarOpen)

  const [isCompact, setIsCompact] = useState(window.innerWidth < 500)

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < 500
      setIsCompact(compact)

      if (compact) {
        if (leftPanelRef.current && !leftPanelRef.current.isCollapsed()) {
          leftPanelRef.current.collapse()
        }
        if (rightPanelRef.current && !rightPanelRef.current.isCollapsed()) {
          rightPanelRef.current.collapse()
        }
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    void (async () => {
      const state = await window.soundbox.getState()
      if (state.collections) {
        setCollections(state.collections)
      }
      if (state.selectedCollectionId) {
        selectCollection(state.selectedCollectionId)
      }
      if (state.lastAudioPath) {
        queueMicrotask(() => selectAudio(state.lastAudioPath))
      }
    })()
  }, [setCollections, selectCollection, selectAudio])

  const toggleLeft = useCallback(() => {
    const panel = leftPanelRef.current
    if (!panel) return
    if (panel.isCollapsed()) {
      panel.expand()
    } else {
      panel.collapse()
    }
  }, [])

  const toggleRight = useCallback(() => {
    const panel = rightPanelRef.current
    if (!panel) return
    if (panel.isCollapsed()) {
      panel.expand()
    } else {
      panel.collapse()
    }
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Global Top Navigation Bar */}
      <div
        className="flex h-10 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-3"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Left: macOS traffic light spacer + left sidebar toggler */}
        <div className="flex items-center gap-1" style={{ paddingLeft: 64 }}>
          {!isCompact && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
              onClick={toggleLeft}
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <PanelLeft className={`h-4 w-4 transition-opacity ${leftSidebarOpen ? 'opacity-100' : 'opacity-50'}`} />
            </Button>
          )}
        </div>

        {/* Right: theme switcher + right sidebar toggler */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {!isCompact && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
              onClick={toggleRight}
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <PanelRight className={`h-4 w-4 transition-opacity ${rightSidebarOpen ? 'opacity-100' : 'opacity-50'}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1 min-h-0 overflow-hidden"
      >
        <ResizablePanel
          panelRef={leftPanelRef}
          defaultSize="18%"
          minSize="12%"
          maxSize="30%"
          collapsible
          collapsedSize="0%"
          // @ts-ignore
          onCollapse={() => setLeftSidebarOpen(false)}
          // @ts-ignore
          onExpand={() => setLeftSidebarOpen(true)}
          className="h-full"
        >
          <FileTree />
        </ResizablePanel>
        {!isCompact && <ResizableHandle className="bg-transparent" />}
        <ResizablePanel defaultSize="52%" minSize="30%" className="h-full">
          <div className="h-full w-full" style={{ containerType: 'inline-size' }}>
            <ScrollArea className="h-full">
              <div className="sticky top-0 left-0 z-30 w-[100cqw] bg-background/95 backdrop-blur-md">
                <AudioPlayer />
              </div>
              <AudioList />
            </ScrollArea>
          </div>
        </ResizablePanel>
        {!isCompact && <ResizableHandle className="bg-transparent" />}
        <ResizablePanel
          panelRef={rightPanelRef}
          defaultSize="30%"
          minSize="15%"
          collapsible
          collapsedSize="0%"
          // @ts-ignore
          onCollapse={() => setRightSidebarOpen(false)}
          // @ts-ignore
          onExpand={() => setRightSidebarOpen(true)}
          className="h-full"
        >
          <SidecarPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
