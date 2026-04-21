import { useCallback, useEffect, useRef } from 'react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { FileTree } from '@/components/file-tree/file-tree'
import { AudioList } from '@/components/player/audio-list'
import { AudioPlayer } from '@/components/player/audio-player'
import { SidecarPanel } from '@/components/sidecar/sidecar-panel'
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
        className="flex h-11 flex-shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-3"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        {/* Left: macOS traffic light spacer + left sidebar toggler */}
        <div className="flex items-center gap-1" style={{ paddingLeft: 68 }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                onClick={toggleLeft}
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                title="Toggle Songs Sidebar"
              >
                <PanelLeft className={`h-4 w-4 transition-opacity ${leftSidebarOpen ? 'opacity-100' : 'opacity-50'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {leftSidebarOpen ? 'Hide' : 'Show'} Songs
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right: right sidebar toggler */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-foreground transition-colors"
                onClick={toggleRight}
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                title="Toggle Companion Text Sidebar"
              >
                <PanelRight className={`h-4 w-4 transition-opacity ${rightSidebarOpen ? 'opacity-100' : 'opacity-50'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {rightSidebarOpen ? 'Hide' : 'Show'} Companion Text
            </TooltipContent>
          </Tooltip>
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
        <ResizableHandle className="bg-transparent" />
        <ResizablePanel defaultSize="52%" minSize="30%" className="h-full">
          <div className="flex h-full flex-col">
            <AudioPlayer />
            <div className="flex min-h-0 flex-1 flex-col">
              <AudioList />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="bg-transparent" />
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
