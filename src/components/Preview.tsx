"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from "lucide-react"
import { useStore } from "@/store"
import SceneRenderer from "./SceneRenderer"

export default function Preview() {
  const { schema, currentScene, setCurrentScene } = useStore()
  const [isPlaying, setIsPlaying] = useState(true)
  const [sceneProgress, setSceneProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef(0)
  const currentSceneRef = useRef(currentScene)
  const totalScenesRef = useRef(0)
  const isPlayingRef = useRef(true)

  const scenes = schema?.scenes ?? []
  const scene = scenes[currentScene]
  const totalScenes = scenes.length

  useEffect(() => { currentSceneRef.current = currentScene }, [currentScene])
  useEffect(() => { totalScenesRef.current = totalScenes }, [totalScenes])
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    progressRef.current = 0
    setSceneProgress(0)
  }, [])

  const startInterval = useCallback((duration: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    progressRef.current = 0
    setSceneProgress(0)
    const tick = 50

    intervalRef.current = setInterval(() => {
      if (!isPlayingRef.current) return
      progressRef.current += tick
      const pct = Math.min(progressRef.current / duration, 1)
      setSceneProgress(pct)

      if (progressRef.current >= duration) {
        progressRef.current = 0
        setSceneProgress(0)
        const next = currentSceneRef.current + 1
        if (next >= totalScenesRef.current) {
          setCurrentScene(0)
        } else {
          setCurrentScene(next)
        }
      }
    }, tick)
  }, [setCurrentScene])

  const goToScene = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, totalScenesRef.current - 1))
    setCurrentScene(clamped)
  }, [setCurrentScene])

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const reset = useCallback(() => {
    setIsPlaying(true)
    setCurrentScene(0)
  }, [setCurrentScene])

  // Auto-play when schema loads
  useEffect(() => {
    if (!schema) {
      stopPlayback()
      return
    }
    setIsPlaying(true)
    const duration = (scenes[0]?.duration ?? 3) * 1000
    setCurrentScene(0)
    startInterval(duration)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema])

  // Restart interval on scene change
  useEffect(() => {
    if (!schema) return
    const duration = (scenes[currentScene]?.duration ?? 3) * 1000
    startInterval(duration)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScene])

  // Cleanup
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  return (
    <div className="preview-panel">
      {/* Canvas */}
      <div className="canvas-wrapper">
        <div className="canvas-frame">
          {schema && scene ? (
            <SceneRenderer
              key={`${currentScene}-${schema.meta.title}`}
              scene={scene}
              isPlaying={isPlaying}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⬡</div>
              <p className="empty-text">Paste a YAML schema<br />to preview your reel</p>
            </div>
          )}

          {/* Progress bar */}
          {schema && (
            <div className="scene-progress-bar">
              <div
                className="scene-progress-fill"
                style={{ width: `${sceneProgress * 100}%` }}
              />
            </div>
          )}

          {/* Scene counter */}
          {schema && totalScenes > 1 && (
            <div className="scene-counter-overlay">
              {currentScene + 1} / {totalScenes}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      {schema && (
        <div className="preview-controls">
          <button className="ctrl-btn" onClick={reset} title="Reset">
            <RotateCcw size={13} />
          </button>
          <button
            className="ctrl-btn"
            onClick={() => goToScene(currentScene - 1)}
            disabled={currentScene === 0}
          >
            <ChevronLeft size={15} />
          </button>
          <button className="ctrl-btn ctrl-btn--play" onClick={togglePlay}>
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            className="ctrl-btn"
            onClick={() => goToScene(currentScene + 1)}
            disabled={currentScene === totalScenes - 1}
          >
            <ChevronRight size={15} />
          </button>

          {/* Scene dots */}
          <div className="scene-dots">
            {scenes.map((_, i) => (
              <button
                key={i}
                className={`scene-dot ${i === currentScene ? "scene-dot--active" : ""}`}
                onClick={() => goToScene(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}