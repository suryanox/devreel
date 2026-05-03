import { create } from "zustand"
import type { ReelSchema, Scene } from "@/types/schema"

interface StoreState {
  schema: ReelSchema | null
  rawInput: string
  parseError: string | null
  currentScene: number
  isPlaying: boolean
  isExporting: boolean
  exportProgress: number
  exportStage: string
  previewReady: boolean

  setSchema: (s: ReelSchema | null) => void
  setRawInput: (r: string) => void
  setParseError: (e: string | null) => void
  setCurrentScene: (n: number) => void
  setIsPlaying: (v: boolean) => void
  setIsExporting: (v: boolean) => void
  setExportProgress: (p: number) => void
  setExportStage: (s: string) => void
  setPreviewReady: (v: boolean) => void
}

export const useStore = create<StoreState>((set) => ({
  schema: null,
  rawInput: "",
  parseError: null,
  currentScene: 0,
  isPlaying: false,
  isExporting: false,
  exportProgress: 0,
  exportStage: "",
  previewReady: false,

  setSchema: (schema) => set({ schema }),
  setRawInput: (rawInput) => set({ rawInput }),
  setParseError: (parseError) => set({ parseError }),
  setCurrentScene: (currentScene) => set({ currentScene }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  setExportStage: (exportStage) => set({ exportStage }),
  setPreviewReady: (previewReady) => set({ previewReady }),
}))