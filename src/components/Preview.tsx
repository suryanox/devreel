"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react"
import { useStore } from "@/store"
import SceneRenderer from "./SceneRenderer"

export default function Preview() {
  const { schema, currentScene, setCurrentScene } = useStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [sceneProgress, setSceneProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef(0)

  const scenes = schema?.scenes ?? []
  const scene = scenes[currentScene]
  const totalScenes = scenes.length
  const sceneDuration = (scene?.duration ?? 3) * 1000

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    setIsPlaying(false)
    progressRef.current = 0
    setSceneProgress(0)
  }, [])

  const goToScene = useCallback(
    (index: number) => {
      stopPlayback()
      setCurrentScene(Math.max(0, Math.min(index, totalScenes - 1)))
    },
    [stopPlayback, setCurrentScene, totalScenes]
  )

  const startPlayback = useCallback(() => {
    setIsPlaying(true)
    progressRef.current = 0
    setSceneProgress(0)
    const tick = 50

    intervalRef.current = setInterval(() => {
      progressRef.current += tick
      const pct = Math.min(progressRef.current / sceneDuration, 1)
      setSceneProgress(pct)

      if (progressRef.current >= sceneDuration) {
        progressRef.current = 0
        setSceneProgress(0)
        setCurrentScene((prev: number) => {
          const next = prev + 1
          if (next >= totalScenes) {
            stopPlayback()
            return prev
          }
          return next
        })
      }
    }, tick)
  }, [sceneDuration, totalScenes, setCurrentScene, stopPlayback])

  const togglePlay = useCallback(() => {
    isPlaying ? stopPlayback() : startPlayback()
  }, [isPlaying, stopPlayback, startPlayback])

  const reset = useCallback(() => {
    stopPlayback()
    setCurrentScene(0)
  }, [stopPlayback, setCurrentScene])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Reset progress when scene changes during playback
  useEffect(() => {
    if (!isPlaying) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    progressRef.current = 0
    setSceneProgress(0)
    const tick = 50

    intervalRef.current = setInterval(() => {
      progressRef.current += tick
      const pct = Math.min(progressRef.current / sceneDuration, 1)
      setSceneProgress(pct)

      if (progressRef.current >= sceneDuration) {
        progressRef.current = 0
        setSceneProgress(0)
        setCurrentScene((prev: number) => {
          const next = prev + 1
          if (next >= totalScenes) {
            stopPlayback()
            return prev
          }
          return next
        })
      }
    }, tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene])

  return (
    <div className="preview-panel">
      {/* Header */}
      <div className="preview-header">
        <span className="preview-title">Preview</span>
        {schema && (
          <span className="preview-meta">
            {totalScenes} scene{totalScenes !== 1 ? "s" : ""} ·{" "}
            {scenes.reduce((a, s) => a + (s.duration ?? 3), 0)}s total
          </span>
        )}
      </div>

      {/* Phone Frame */}
      <div className="phone-frame-wrapper">
        <div className="phone-frame">
          <div className="phone-notch" />
          <div className="phone-screen">
            {schema && scene ? (
              <SceneRenderer scene={scene} isPlaying={isPlaying} />
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⬡</div>
                <p className="empty-text">Paste a schema to preview your reel</p>
              </div>
            )}
          </div>
          {schema && (
            <div className="scene-progress-bar">
              <div
                className="scene-progress-fill"
                style={{ width: `${sceneProgress * 100}%` }}
              />
            </div>
          )}
          <div className="phone-home-bar" />
        </div>
      </div>

      {/* Controls */}
      {schema && (
        <div className="preview-controls">
          <button className="ctrl-btn" onClick={reset} title="Reset">
            <RotateCcw size={14} />
          </button>
          <button
            className="ctrl-btn"
            onClick={() => goToScene(currentScene - 1)}
            disabled={currentScene === 0}
          >
            <ChevronLeft size={16} />
          </button>
          <button className="ctrl-btn ctrl-btn--play" onClick={togglePlay}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            className="ctrl-btn"
            onClick={() => goToScene(currentScene + 1)}
            disabled={currentScene === totalScenes - 1}
          >
            <ChevronRight size={16} />
          </button>
          <span className="scene-counter">
            {currentScene + 1} / {totalScenes}
          </span>
        </div>
      )}

      {/* Scene dots */}
      {schema && totalScenes > 1 && (
        <div className="scene-dots">
          {scenes.map((_, i) => (
            <button
              key={i}
              className={`scene-dot ${i === currentScene ? "scene-dot--active" : ""}`}
              onClick={() => goToScene(i)}
            />
          ))}
        </div>
      )}

      {/* Export */}
      {schema && (
        <div style={{ width: "100%", maxWidth: 380, display: "flex", justifyContent: "center" }}>
        </div>
      )}
    </div>
  )
}