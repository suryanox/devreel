import { useEffect, useRef } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { useStore } from "@/store"

const ffmpegInstance = new FFmpeg()

export function useFFmpeg() {
  const { ffmpegLoaded, ffmpegLoading, setFfmpegLoaded, setFfmpegLoading, setExportProgress, setExportStage } = useStore()
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current || ffmpegLoaded || ffmpegLoading) return
    load()
  }, [])

  async function load() {
    setFfmpegLoading(true)
    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd"
      ffmpegInstance.on("log", ({ message }) => {
        console.log("[FFmpeg]", message)
      })
      ffmpegInstance.on("progress", ({ progress }) => {
        setExportProgress(Math.round(progress * 100))
      })
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      })
      loadedRef.current = true
      setFfmpegLoaded(true)
    } catch (e) {
      console.error("FFmpeg load error:", e)
    } finally {
      setFfmpegLoading(false)
    }
  }

  async function exportVideo(
    recordingBlob: Blob,
    outputFilename: string = "devreel_export.mp4"
  ): Promise<Blob> {
    if (!ffmpegLoaded) throw new Error("FFmpeg not loaded")

    setExportStage("Writing input file")
    setExportProgress(0)

    const inputData = await fetchFile(recordingBlob)
    await ffmpegInstance.writeFile("input.webm", inputData)

    setExportStage("Encoding to H.264")

    await ffmpegInstance.exec([
      "-i", "input.webm",
      "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "18",
      "-c:a", "aac",
      "-b:a", "192k",
      "-movflags", "+faststart",
      "-y",
      "output.mp4",
    ])

    setExportStage("Finalizing")

    const data = await ffmpegInstance.readFile("output.mp4")
    await ffmpegInstance.deleteFile("input.webm")
    await ffmpegInstance.deleteFile("output.mp4")

    setExportProgress(100)
    setExportStage("Done")

    return new Blob([data], { type: "video/mp4" })
  }

  return { ffmpegLoaded, ffmpegLoading, exportVideo, load }
}