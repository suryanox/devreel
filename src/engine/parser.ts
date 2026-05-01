import yaml from "js-yaml"
import type { ReelSchema, Scene, SceneElement } from "@/types/schema"

const VALID_BACKGROUNDS = ["terminal", "blackboard", "code_editor", "gradient", "solid", "space"]
const VALID_ELEMENTS = ["text", "code", "bullet_list", "image", "arrow", "divider"]
const VALID_ANIMATIONS_IN = ["fade_in", "zoom_in", "slide_up", "slide_left", "slide_right", "type_in", "pop_in", "none"]
const VALID_ANIMATIONS_OUT = ["fade_out", "zoom_out", "slide_up", "slide_down", "none"]
const VALID_POSITIONS = ["center", "top", "bottom", "top_left", "top_right", "bottom_left", "bottom_right"]

export interface ParseResult {
  schema: ReelSchema | null
  error: string | null
}

export function parseSchema(input: string): ParseResult {
  if (!input.trim()) {
    return { schema: null, error: "Empty input" }
  }

  let raw: any

  try {
    raw = yaml.load(input)
  } catch (e: any) {
    try {
      raw = JSON.parse(input)
    } catch {
      return { schema: null, error: `Parse error: ${e.message}` }
    }
  }

  if (!raw || typeof raw !== "object") {
    return { schema: null, error: "Schema must be an object" }
  }

  if (!raw.meta) {
    return { schema: null, error: "Missing required field: meta" }
  }

  if (!raw.scenes || !Array.isArray(raw.scenes)) {
    return { schema: null, error: "Missing required field: scenes (must be an array)" }
  }

  if (raw.scenes.length === 0) {
    return { schema: null, error: "scenes array must have at least one scene" }
  }

  const sceneErrors = validateScenes(raw.scenes)
  if (sceneErrors) {
    return { schema: null, error: sceneErrors }
  }

  const schema: ReelSchema = {
    meta: {
      title: raw.meta.title || "Untitled Reel",
      aspect_ratio: "9:16",
      fps: raw.meta.fps || 30,
      background: raw.meta.background || "#020617",
      font: raw.meta.font || "Inter",
    },
    scenes: raw.scenes.map((s: any, i: number) => normalizeScene(s, i)),
  }

  return { schema, error: null }
}

function validateScenes(scenes: any[]): string | null {
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i]
    const prefix = `Scene ${i + 1}`

    if (!s.duration || typeof s.duration !== "number") {
      return `${prefix}: missing or invalid duration (must be a number in seconds)`
    }

    if (s.duration <= 0 || s.duration > 30) {
      return `${prefix}: duration must be between 0 and 30 seconds`
    }

    if (!s.elements || !Array.isArray(s.elements)) {
      return `${prefix}: missing elements array`
    }

    if (s.background?.type && !VALID_BACKGROUNDS.includes(s.background.type)) {
      return `${prefix}: unknown background type "${s.background.type}". Valid: ${VALID_BACKGROUNDS.join(", ")}`
    }

    for (let j = 0; j < s.elements.length; j++) {
      const el = s.elements[j]
      const elPrefix = `${prefix}, element ${j + 1}`

      if (!el.type || !VALID_ELEMENTS.includes(el.type)) {
        return `${elPrefix}: unknown element type "${el.type}". Valid: ${VALID_ELEMENTS.join(", ")}`
      }

      if (el.animation_in && !VALID_ANIMATIONS_IN.includes(el.animation_in)) {
        return `${elPrefix}: unknown animation_in "${el.animation_in}". Valid: ${VALID_ANIMATIONS_IN.join(", ")}`
      }

      if (el.animation_out && !VALID_ANIMATIONS_OUT.includes(el.animation_out)) {
        return `${elPrefix}: unknown animation_out "${el.animation_out}". Valid: ${VALID_ANIMATIONS_OUT.join(", ")}`
      }

      if (el.position && !VALID_POSITIONS.includes(el.position)) {
        return `${elPrefix}: unknown position "${el.position}". Valid: ${VALID_POSITIONS.join(", ")}`
      }

      if (el.type === "text" && !el.value) {
        return `${elPrefix}: text element requires a value`
      }

      if (el.type === "code" && !el.value) {
        return `${elPrefix}: code element requires a value`
      }

      if (el.type === "bullet_list" && (!el.items || !Array.isArray(el.items))) {
        return `${elPrefix}: bullet_list requires an items array`
      }
    }
  }

  return null
}

function normalizeScene(s: any, index: number): Scene {
  return {
    id: s.id || index + 1,
    duration: s.duration,
    background: s.background ? {
      type: s.background.type || "solid",
      color: s.background.color,
      gradient: s.background.gradient,
      language: s.background.language,
      theme: s.background.theme || "dark",
      star_count: s.background.star_count || 100,
    } : {
      type: "solid",
    },
    elements: s.elements.map(normalizeElement),
    transition: s.transition || "fade",
  }
}

function normalizeElement(el: any): SceneElement {
  const base = {
    animation_in: el.animation_in || "fade_in",
    animation_out: el.animation_out || "fade_out",
    position: el.position || "center",
    delay: el.delay || 0,
  }

  switch (el.type) {
    case "text":
      return {
        ...base,
        type: "text",
        value: el.value,
        style: el.style || "body",
        color: el.color,
        size: el.size,
      }
    case "code":
      return {
        ...base,
        type: "code",
        value: el.value,
        language: el.language || "rust",
        highlight_lines: el.highlight_lines || [],
      }
    case "bullet_list":
      return {
        ...base,
        type: "bullet_list",
        items: el.items,
        color: el.color,
        stagger: el.stagger || 0.3,
      }
    case "image":
      return {
        ...base,
        type: "image",
        src: el.src,
        width: el.width,
        height: el.height,
      }
    case "arrow":
      return {
        ...base,
        type: "arrow",
        from: el.from || "top",
        to: el.to || "bottom",
        color: el.color || "#a78bfa",
        label: el.label,
      }
    case "divider":
      return {
        ...base,
        type: "divider",
        color: el.color || "rgba(255,255,255,0.2)",
      }
    default:
      return { ...base, type: "text", value: "", style: "body" }
  }
}