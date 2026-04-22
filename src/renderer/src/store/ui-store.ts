import { create } from 'zustand'

type UIState = {
  leftSidebarOpen: boolean
  leftSidebarWidth: number
  isSearchOpen: boolean
  searchQuery: string
  toggleLeftSidebar: () => void
  setLeftSidebarOpen: (open: boolean) => void
  setLeftSidebarWidth: (w: number) => void
  setIsSearchOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
}

export const useUI = create<UIState>((set) => ({
  leftSidebarOpen: true,
  leftSidebarWidth: 220,
  isSearchOpen: false,
  searchQuery: '',
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
  setLeftSidebarOpen: (leftSidebarOpen) => set({ leftSidebarOpen }),
  setLeftSidebarWidth: (leftSidebarWidth) => set({ leftSidebarWidth }),
  setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen, searchQuery: isSearchOpen ? '' : '' }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))

