import { useCallback, useEffect, useState } from 'react'
import {
  PanelLeft,
  PanelRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThreePane } from '@/components/layout/three-pane'
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

  const leftSidebarOpen = useUI((s) => s.leftSidebarOpen)
  const rightSidebarOpen = useUI((s) => s.rightSidebarOpen)
  const leftSidebarWidth = useUI((s) => s.leftSidebarWidth)
  const rightSidebarWidth = useUI((s) => s.rightSidebarWidth)
  const setLeftSidebarOpen = useUI((s) => s.setLeftSidebarOpen)
  const setRightSidebarOpen = useUI((s) => s.setRightSidebarOpen)
  const setLeftSidebarWidth = useUI((s) => s.setLeftSidebarWidth)
  const setRightSidebarWidth = useUI((s) => s.setRightSidebarWidth)

  const [isCompact, setIsCompact] = useState(window.innerWidth < 500)

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < 500
      setIsCompact(compact)

      if (compact) {
        setLeftSidebarOpen(false)
        setRightSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [setLeftSidebarOpen, setRightSidebarOpen])

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
    setLeftSidebarOpen(!leftSidebarOpen)
  }, [leftSidebarOpen, setLeftSidebarOpen])

  const toggleRight = useCallback(() => {
    setRightSidebarOpen(!rightSidebarOpen)
  }, [rightSidebarOpen, setRightSidebarOpen])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Global Top Navigation Bar */}
      <header
        className="app-drag flex h-11 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-3"
      >
        {/* Left: macOS traffic light spacer + left sidebar toggler */}
        <div className="flex items-center gap-1 shrink-0" style={{ paddingLeft: 64 }}>
          {!isCompact && (
            <Button
              size="icon"
              variant="ghost"
              className="app-no-drag size-7"
              aria-label={leftSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              aria-pressed={leftSidebarOpen}
              onClick={toggleLeft}
            >
              <PanelLeft className={`size-4 transition-opacity ${leftSidebarOpen ? 'opacity-100' : 'opacity-50'}`} />
            </Button>
          )}
        </div>

        {/* Right: theme switcher + right sidebar toggler */}
        <div className="app-no-drag flex items-center gap-2 shrink-0">
          <ThemeSwitcher />
          {!isCompact && (
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              aria-label={rightSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              aria-pressed={rightSidebarOpen}
              onClick={toggleRight}
            >
              <PanelRight className={`size-4 transition-opacity ${rightSidebarOpen ? 'opacity-100' : 'opacity-50'}`} />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <ThreePane
        leftOpen={!isCompact && leftSidebarOpen}
        rightOpen={!isCompact && rightSidebarOpen}
        leftWidth={leftSidebarWidth}
        rightWidth={rightSidebarWidth}
        onLeftWidthChange={setLeftSidebarWidth}
        onRightWidthChange={setRightSidebarWidth}
        left={<FileTree />}
        center={
          <div className="h-full w-full" style={{ containerType: 'inline-size' }}>
            <ScrollArea className="h-full">
              <div className="sticky top-0 left-0 z-30 w-[100cqw] bg-background/95 backdrop-blur-md">
                <AudioPlayer />
              </div>
              <AudioList />
            </ScrollArea>
          </div>
        }
        right={<SidecarPanel />}
      />
    </div>
  )
}
