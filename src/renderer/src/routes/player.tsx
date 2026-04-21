import { useEffect } from 'react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { FileTree } from '@/components/file-tree/file-tree'
import { AudioList } from '@/components/player/audio-list'
import { AudioPlayer } from '@/components/player/audio-player'
import { SidecarPanel } from '@/components/sidecar/sidecar-panel'
import { useLibrary } from '@/store/library-store'

export function PlayerRoute(): React.JSX.Element {
  const setRoot = useLibrary((s) => s.setRoot)
  const selectAudio = useLibrary((s) => s.selectAudio)

  useEffect(() => {
    void (async () => {
      const state = await window.soundbox.getState()
      if (state.rootFolder) {
        setRoot(state.rootFolder)
        if (state.lastAudioPath) {
          queueMicrotask(() => selectAudio(state.lastAudioPath))
        }
      }
    })()
  }, [setRoot, selectAudio])

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-screen min-h-screen overflow-hidden"
    >
      <ResizablePanel
        defaultSize="18%"
        minSize="12%"
        maxSize="30%"
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
        defaultSize="30%"
        minSize="15%"
        className="h-full"
      >
        <SidecarPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
