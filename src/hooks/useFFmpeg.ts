import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export type ExportStatus = "idle" | "loading" | "capturing" | "encoding" | "done" | "error";

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (ffmpegRef.current) return;
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegRef.current = ffmpeg;
  }, []);

  const captureFrame = useCallback(
    async (canvas: HTMLCanvasElement): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to capture frame"));
        }, "image/png");
      });
    },
    []
  );

  const exportVideo = useCallback(
    async (
      sceneElements: HTMLElement[],
      fps: number = 30,
      sceneDurations: number[]
    ) => {
      setStatus("loading");
      setProgress(0);
      setErrorMsg(null);
      setVideoURL(null);

      try {
        await load();
        const ffmpeg = ffmpegRef.current!;

        setStatus("capturing");

        // Create an offscreen canvas at 1080x1920 (9:16)
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        let frameIndex = 0;

        for (let s = 0; s < sceneElements.length; s++) {
          const el = sceneElements[s];
          const duration = sceneDurations[s] ?? 3;
          const frameCount = Math.round(duration * fps);

          for (let f = 0; f < frameCount; f++) {
            // Draw the scene element onto canvas via html2canvas-like approach
            // We scale the 360x640 preview up to 1080x1920
            ctx.clearRect(0, 0, 1080, 1920);
            ctx.fillStyle = "#020617";
            ctx.fillRect(0, 0, 1080, 1920);

            // Render scene element using drawImage if it's a canvas,
            // otherwise fill with background color as placeholder
            if (el instanceof HTMLCanvasElement) {
              ctx.drawImage(el, 0, 0, 1080, 1920);
            } else {
              // Fallback: solid bg — real impl would use html-to-image here
              ctx.fillStyle = "#020617";
              ctx.fillRect(0, 0, 1080, 1920);
            }

            const frameBlob = await captureFrame(canvas);
            const frameData = await fetchFile(frameBlob);
            const frameName = `frame${String(frameIndex).padStart(5, "0")}.png`;
            await ffmpeg.writeFile(frameName, frameData);
            frameIndex++;

            setProgress(Math.round((frameIndex / (sceneDurations.reduce((a, d) => a + d, 0) * fps)) * 60));
          }
        }

        setStatus("encoding");

        await ffmpeg.exec([
          "-framerate", String(fps),
          "-i", "frame%05d.png",
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-crf", "18",
          "-preset", "fast",
          "output.mp4",
        ]);

        const data = await ffmpeg.readFile("output.mp4");
        const blob = new Blob([data], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setStatus("done");
        setProgress(100);
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Export failed");
      }
    },
    [load, captureFrame]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setErrorMsg(null);
    if (videoURL) URL.revokeObjectURL(videoURL);
    setVideoURL(null);
  }, [videoURL]);

  return {
    status,
    progress,
    errorMsg,
    videoURL,
    exportVideo,
    reset,
  };
}