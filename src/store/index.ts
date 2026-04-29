import { create } from "zustand"

type RecordingStatus = "idle" | "recording" | "paused"
type CaptionStyle = "bold-yellow" | "white" | "kinetic"
type Tool = "draw" | "code"
type CursorStyle = "pointer" | "hand"
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
  showCaptions: boolean
  hasRecording: boolean
  recordingBlob: Blob | null
  codeLanguage: "rust" | "python"
  codeContent: string
  ffmpegLoaded: boolean
  ffmpegLoading: boolean
  exportProgress: number
  exportStage: string
  cursorStyle: CursorStyle
  showCamera: boolean
  cameraMode: "pip" | "half"
  exportResolution: "1080p" | "720p" | "4k" | "8k"
  presentMode: boolean

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
  setShowCaptions: (v: boolean) => void
  setHasRecording: (v: boolean) => void
  setRecordingBlob: (b: Blob | null) => void
  setCodeLanguage: (l: "rust" | "python") => void
  setCodeContent: (c: string) => void
  setFfmpegLoaded: (v: boolean) => void
  setFfmpegLoading: (v: boolean) => void
  setExportProgress: (p: number) => void
  setExportStage: (s: string) => void
  setCursorStyle: (c: CursorStyle) => void
  setShowCamera: (v: boolean) => void
  setCameraMode: (m: "pip" | "half") => void
  setExportResolution: (r: "1080p" | "720p" | "4k" | "8k") => void
  setPresentMode: (v: boolean) => void
}

export const useStore = create<StoreState>((set) => ({
  status: "idle",
  duration: 0,
  tool: "draw",
  captionStyle: "bold-yellow",
  template: "quick-tip",
  captions: [],
  activeCaptions: [],
  brushColor: "#f97316",
  brushSize: 3,
  showCode: false,
  showCaptions: false,
  hasRecording: false,
  recordingBlob: null,
  codeLanguage: "rust",
  codeContent: "",
  ffmpegLoaded: false,
  ffmpegLoading: false,
  exportProgress: 0,
  exportStage: "",
  cursorStyle: "pointer",
  showCamera: false,
  cameraMode: "pip",
  exportResolution: "4k",
  presentMode: false,

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
  setShowCaptions: (showCaptions) => set({ showCaptions }),
  setHasRecording: (hasRecording) => set({ hasRecording }),
  setRecordingBlob: (recordingBlob) => set({ recordingBlob }),
  setCodeLanguage: (codeLanguage) => set({ codeLanguage }),
  setCodeContent: (codeContent) => set({ codeContent }),
  setFfmpegLoaded: (ffmpegLoaded) => set({ ffmpegLoaded }),
  setFfmpegLoading: (ffmpegLoading) => set({ ffmpegLoading }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  setExportStage: (exportStage) => set({ exportStage }),
  setCursorStyle: (cursorStyle) => set({ cursorStyle }),
  setShowCamera: (showCamera) => set({ showCamera }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  setExportResolution: (exportResolution) => set({ exportResolution }),
  setPresentMode: (presentMode) => set({ presentMode }),
}))