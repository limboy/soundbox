import { create } from 'zustand'

type UIState = {
  leftSidebarOpen: boolean
  leftSidebarWidth: number
  toggleLeftSidebar: () => void
  setLeftSidebarOpen: (open: boolean) => void
  setLeftSidebarWidth: (w: number) => void
}

export const useUI = create<UIState>((set) => ({
  leftSidebarOpen: true,
  leftSidebarWidth: 220,
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
  setLeftSidebarWidth: (leftSidebarWidth) => set({ leftSidebarWidth }),
}))

