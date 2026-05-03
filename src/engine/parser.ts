import yaml from "js-yaml"
import type {
  ReelSchema,
  Scene,
  SceneElement,
  FlowNode,
  FlowEdge,
  StackLayer,
  SplitPanel,
  TreeNode,
  RankingCard,
} from "@/types/schema"

const VALID_BACKGROUNDS = ["solid"]

const VALID_ELEMENTS = [
  "text", "code", "code_highlight", "bullet_list",
  "image", "arrow", "divider", "callout",
  "flow_diagram", "stack_diagram", "split_screen", "tree_diagram", "ranking_cards",
]

const VALID_ANIMATIONS_IN = [
  "fade_in", "zoom_in", "slide_up", "slide_left",
  "slide_right", "type_in", "pop_in", "glitch", "draw_in", "none",
]

const VALID_ANIMATIONS_OUT = [
  "fade_out", "zoom_out", "slide_up", "slide_down", "none",
]

const VALID_POSITIONS = [
  "center", "top", "bottom",
  "top_left", "top_right", "bottom_left", "bottom_right",
]

const VALID_IDLE = ["float", "float_3d", "pulse", "glow", "none"]

const VALID_LANGUAGES = ["rust", "python", "typescript", "bash", "json", "c", "cpp"]

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
      background: raw.meta.background || "#080810",
      font: raw.meta.font || "Inter",
    },
    scenes: raw.scenes.map((s: any, i: number) => normalizeScene(s, i)),
  }

  return { schema, error: null }
}

// ─── Validation ────────────────────────────────────────────

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

      if (el.idle && !VALID_IDLE.includes(el.idle)) {
        return `${elPrefix}: unknown idle "${el.idle}". Valid: ${VALID_IDLE.join(", ")}`
      }

      const err = validateElement(el, elPrefix)
      if (err) return err
    }
  }

  return null
}

function validateElement(el: any, prefix: string): string | null {
  switch (el.type) {
    case "text":
      if (!el.value) return `${prefix}: text element requires a value`
      break

    case "code":
    case "code_highlight":
      if (!el.value) return `${prefix}: code element requires a value`
      if (el.language && !VALID_LANGUAGES.includes(el.language)) {
        return `${prefix}: unknown language "${el.language}". Valid: ${VALID_LANGUAGES.join(", ")}`
      }
      break

    case "bullet_list":
      if (!el.items || !Array.isArray(el.items) || el.items.length === 0) {
        return `${prefix}: bullet_list requires a non-empty items array`
      }
      break

    case "callout":
      if (!el.value) return `${prefix}: callout element requires a value`
      break

    case "flow_diagram":
      if (!el.nodes || !Array.isArray(el.nodes) || el.nodes.length === 0) {
        return `${prefix}: flow_diagram requires a non-empty nodes array`
      }
      if (!el.edges || !Array.isArray(el.edges)) {
        return `${prefix}: flow_diagram requires an edges array`
      }
      for (const node of el.nodes) {
        if (!node.id || !node.label) {
          return `${prefix}: each flow_diagram node requires id and label`
        }
      }
      for (const edge of el.edges) {
        if (!edge.from || !edge.to) {
          return `${prefix}: each flow_diagram edge requires from and to`
        }
        const nodeIds = el.nodes.map((n: any) => n.id)
        if (!nodeIds.includes(edge.from)) {
          return `${prefix}: edge references unknown node id "${edge.from}"`
        }
        if (!nodeIds.includes(edge.to)) {
          return `${prefix}: edge references unknown node id "${edge.to}"`
        }
      }
      break

    case "stack_diagram":
      if (!el.layers || !Array.isArray(el.layers) || el.layers.length === 0) {
        return `${prefix}: stack_diagram requires a non-empty layers array`
      }
      for (const layer of el.layers) {
        if (!layer.label) {
          return `${prefix}: each stack_diagram layer requires a label`
        }
      }
      break

    case "split_screen":
      if (!el.left || !el.right) {
        return `${prefix}: split_screen requires left and right panels`
      }
      if (!el.left.label || !el.right.label) {
        return `${prefix}: split_screen panels require a label`
      }
      if (!Array.isArray(el.left.items) || !Array.isArray(el.right.items)) {
        return `${prefix}: split_screen panels require an items array`
      }
      break

    case "tree_diagram":
      if (!el.nodes || !Array.isArray(el.nodes) || el.nodes.length === 0) {
        return `${prefix}: tree_diagram requires a non-empty nodes array`
      }
      for (const node of el.nodes) {
        const err = validateTreeNode(node, prefix)
        if (err) return err
      }
      break

    case "ranking_cards":
      if (!el.items || !Array.isArray(el.items) || el.items.length === 0) {
        return `${prefix}: ranking_cards requires a non-empty items array`
      }
      for (const item of el.items) {
        if (!item.title) {
          return `${prefix}: each ranking_cards item requires a title`
        }
      }
      break
  }

  return null
}

function validateTreeNode(node: any, prefix: string): string | null {
  if (!node.label) {
    return `${prefix}: each tree_diagram node requires a label`
  }

  if (node.children) {
    if (!Array.isArray(node.children)) {
      return `${prefix}: tree_diagram node children must be an array`
    }
    for (const child of node.children) {
      const err = validateTreeNode(child, prefix)
      if (err) return err
    }
  }

  return null
}

// ─── Normalization ─────────────────────────────────────────

function normalizeScene(s: any, index: number): Scene {
  return {
    id: s.id || index + 1,
    duration: s.duration,
    background: s.background
      ? {
          type: s.background.type || "solid",
          color: s.background.color,
          gradient: s.background.gradient,
          language: s.background.language,
          theme: s.background.theme || "dark",
          star_count: s.background.star_count || 100,
        }
      : { type: "solid" },
    elements: s.elements.map(normalizeElement),
    transition: s.transition || "fade",
  }
}

function normalizeBase(el: any) {
  return {
    animation_in: el.animation_in || "fade_in",
    animation_out: el.animation_out || "fade_out",
    position: el.position || "center",
    delay: el.delay || 0,
    idle: el.idle || "none",
  }
}

function normalizeElement(el: any): SceneElement {
  const base = normalizeBase(el)
  const normalizeTreeNode = (node: any): TreeNode => ({
    label: node.label,
    accent: node.accent || false,
    color: node.color,
    children: Array.isArray(node.children)
      ? node.children.map((child: any) => normalizeTreeNode(child))
      : [],
  })

  switch (el.type) {
    case "text":
      return {
        ...base,
        type: "text",
        value: el.value,
        style: el.style || "body",
        color: el.color,
        size: el.size,
        highlight_token: el.highlight_token || "",
        highlight_color: el.highlight_color || "#facc15",
      }

    case "code":
      return {
        ...base,
        type: "code",
        value: el.value,
        language: el.language || "rust",
        highlight_lines: el.highlight_lines || [],
      }

    case "code_highlight":
      return {
        ...base,
        type: "code_highlight",
        value: el.value,
        language: el.language || "rust",
        highlight_token: el.highlight_token || "",
        highlight_color: el.highlight_color || "#22d3ee",
      }

    case "bullet_list":
      return {
        ...base,
        type: "bullet_list",
        items: el.items,
        color: el.color,
        stagger: el.stagger ?? 0.3,
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
        color: el.color || "#22d3ee",
        label: el.label,
      }

    case "divider":
      return {
        ...base,
        type: "divider",
        color: el.color || "rgba(255,255,255,0.1)",
      }

    case "callout":
      return {
        ...base,
        type: "callout",
        value: el.value,
        accent: el.accent || "#22d3ee",
      }

    case "flow_diagram":
      return {
        ...base,
        type: "flow_diagram",
        direction: el.direction || "horizontal",
        nodes: (el.nodes as any[]).map((n: any): FlowNode => ({
          id: n.id,
          label: n.label,
          accent: n.accent || false,
          color: n.color,
        })),
        edges: (el.edges as any[]).map((e: any): FlowEdge => ({
          from: e.from,
          to: e.to,
          label: e.label,
          animated: e.animated ?? true,
        })),
      }

    case "stack_diagram":
      return {
        ...base,
        type: "stack_diagram",
        title: el.title,
        stagger: el.stagger ?? 0.2,
        layers: (el.layers as any[]).map((l: any): StackLayer => ({
          label: l.label,
          sublabel: l.sublabel,
          color: l.color,
          accent: l.accent || false,
        })),
      }

    case "split_screen": {
      const normalizePanel = (p: any): SplitPanel => ({
        label: p.label,
        items: p.items || [],
        color: p.color,
        icon: p.icon,
      })
      return {
        ...base,
        type: "split_screen",
        title: el.title,
        left: normalizePanel(el.left),
        right: normalizePanel(el.right),
      }
    }

    case "tree_diagram":
      return {
        ...base,
        type: "tree_diagram",
        title: el.title,
        stagger: el.stagger ?? 0.12,
        nodes: (el.nodes as any[]).map((node: any): TreeNode => normalizeTreeNode(node)),
      }

    case "ranking_cards":
      return {
        ...base,
        type: "ranking_cards",
        title: el.title,
        stagger: el.stagger ?? 0.14,
        items: (el.items as any[]).map((item: any): RankingCard => ({
          title: item.title,
          subtitle: item.subtitle,
          score: item.score,
          badge: item.badge,
          color: item.color,
          accent: item.accent || false,
        })),
      }

    default:
      return { ...base, type: "text", value: "", style: "body" }
  }
}
