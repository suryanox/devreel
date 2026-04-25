import { create } from "zustand"

type RecordingStatus = "idle" | "recording" | "paused"
type CaptionStyle = "bold-yellow" | "white" | "kinetic"
type Tool = "cursor" | "draw" | "code" | "caption" | "browser"
type Template = "quick-tip" | "bug-fix" | "whiteboard" | "live-code"

interface Caption {
  id: string
  text: string
  startTime: number
  endTime: number
}

interface StoreState {
  status: RecordingStatus
  duration: number
  tool: Tool
  captionStyle: CaptionStyle
  template: Template
  captions: Caption[]
  activeCaptions: Caption[]
  brushColor: string
  brushSize: number
  showCode: boolean
  showWhiteboard: boolean
  showBrowser: boolean
  browserUrl: string
  codeLanguage: "rust" | "python"
  codeContent: string

  setStatus: (s: RecordingStatus) => void
  setDuration: (d: number) => void
  setTool: (t: Tool) => void
  setCaptionStyle: (s: CaptionStyle) => void
  setTemplate: (t: Template) => void
  addCaption: (c: Caption) => void
  setActiveCaptions: (c: Caption[]) => void
  setBrushColor: (c: string) => void
  setBrushSize: (s: number) => void
  setShowCode: (v: boolean) => void
  setShowWhiteboard: (v: boolean) => void
  setShowBrowser: (v: boolean) => void
  setBrowserUrl: (u: string) => void
  setCodeLanguage: (l: "rust" | "python") => void
  setCodeContent: (c: string) => void
}

export const useStore = create<StoreState>((set) => ({
  status: "idle",
  duration: 0,
  tool: "cursor",
  captionStyle: "bold-yellow",
  template: "quick-tip",
  captions: [],
  activeCaptions: [],
  brushColor: "#f97316",
  brushSize: 3,
  showCode: false,
  showWhiteboard: false,
  showBrowser: false,
  browserUrl: "https://google.com",
  codeLanguage: "rust",
  codeContent: "",

  setStatus: (status) => set({ status }),
  setDuration: (duration) => set({ duration }),
  setTool: (tool) => set({ tool }),
  setCaptionStyle: (captionStyle) => set({ captionStyle }),
  setTemplate: (template) => set({ template }),
  addCaption: (c) => set((s) => ({ captions: [...s.captions, c] })),
  setActiveCaptions: (activeCaptions) => set({ activeCaptions }),
  setBrushColor: (brushColor) => set({ brushColor }),
  setBrushSize: (brushSize) => set({ brushSize }),
  setShowCode: (showCode) => set({ showCode }),
  setShowWhiteboard: (showWhiteboard) => set({ showWhiteboard }),
  setShowBrowser: (showBrowser) => set({ showBrowser }),
  setBrowserUrl: (browserUrl) => set({ browserUrl }),
  setCodeLanguage: (codeLanguage) => set({ codeLanguage }),
  setCodeContent: (codeContent) => set({ codeContent }),
}))