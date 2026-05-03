import { useEffect, useCallback } from "react"
import { useStore } from "@/store"
import { parseSchema } from "@/engine/parser"

export function useEngine() {
  const {
    rawInput,
    schema,
    setSchema,
    setParseError,
    setCurrentScene,
    currentScene,
  } = useStore()

  useEffect(() => {
    if (!rawInput || rawInput.trim() === "") {
      setSchema(null)
      setParseError(null)
      return
    }

    const { schema: parsed, error } = parseSchema(rawInput)

    if (error || !parsed) {
      setSchema(null)
      setParseError(error ?? "Invalid schema")
      return
    }

    setSchema(parsed)
    setParseError(null)
    setCurrentScene(0)
  }, [rawInput, setSchema, setParseError, setCurrentScene])

  const goToScene = useCallback(
    (index: number) => {
      if (!schema) return
      const clamped = Math.max(0, Math.min(index, schema.scenes.length - 1))
      setCurrentScene(clamped)
    },
    [schema, setCurrentScene]
  )

  const nextScene = useCallback(() => {
    if (!schema) return
    goToScene(currentScene + 1)
  }, [schema, currentScene, goToScene])

  const prevScene = useCallback(() => {
    goToScene(currentScene - 1)
  }, [currentScene, goToScene])

  const totalScenes = schema?.scenes.length ?? 0
  const currentSceneData = schema?.scenes[currentScene] ?? null
  const hasNext = currentScene < totalScenes - 1
  const hasPrev = currentScene > 0

  return {
    schema,
    currentScene,
    currentSceneData,
    totalScenes,
    hasNext,
    hasPrev,
    goToScene,
    nextScene,
    prevScene,
  }
}