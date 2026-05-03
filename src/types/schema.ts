export type AspectRatio = "9:16"

export type AnimationIn =
  | "fade_in"
  | "zoom_in"
  | "slide_up"
  | "slide_left"
  | "slide_right"
  | "type_in"
  | "pop_in"
  | "glitch"
  | "draw_in"
  | "none"

export type AnimationOut =
  | "fade_out"
  | "zoom_out"
  | "slide_up"
  | "slide_down"
  | "none"

export type IdleAnimation =
  | "float"
  | "float_3d"
  | "pulse"
  | "glow"
  | "none"

export type Position =
  | "center"
  | "top"
  | "bottom"
  | "top_left"
  | "top_right"
  | "bottom_left"
  | "bottom_right"

export type TextStyle =
  | "hook"
  | "title"
  | "subtitle"
  | "body"
  | "caption"
  | "code_label"

export type BackgroundType =
  | "terminal"
  | "blackboard"
  | "code_editor"
  | "gradient"
  | "solid"
  | "space"
  | "grid_3d"
  | "circuit"

export type ElementType =
  | "text"
  | "code"
  | "code_highlight"
  | "bullet_list"
  | "image"
  | "arrow"
  | "divider"
  | "flow_diagram"
  | "stack_diagram"
  | "split_screen"
  | "callout"

// ─── Element interfaces ────────────────────────────────────

export interface TextElement {
  type: "text"
  value: string
  style?: TextStyle
  position?: Position
  color?: string
  size?: number
  animation_in?: AnimationIn
  animation_out?: AnimationOut
  idle?: IdleAnimation
  delay?: number
}

export interface CodeElement {
  type: "code"
  value: string
  language?: "rust" | "python" | "typescript" | "bash" | "json" | "c" | "cpp"
  highlight_lines?: number[]
  position?: Position
  animation_in?: AnimationIn
  animation_out?: AnimationOut
  idle?: IdleAnimation
  delay?: number
}

export interface CodeHighlightElement {
  type: "code_highlight"
  value: string
  language?: "rust" | "python" | "typescript" | "bash" | "json" | "c" | "cpp"
  highlight_token?: string        // word or token to glow
  highlight_color?: string        // override glow color
  position?: Position
  animation_in?: AnimationIn
  animation_out?: AnimationOut
  idle?: IdleAnimation
  delay?: number
}

export interface BulletListElement {
  type: "bullet_list"
  items: string[]
  position?: Position
  color?: string
  animation_in?: AnimationIn
  idle?: IdleAnimation
  delay?: number
  stagger?: number
}

export interface ImageElement {
  type: "image"
  src: string
  position?: Position
  width?: number
  height?: number
  animation_in?: AnimationIn
  animation_out?: AnimationOut
  idle?: IdleAnimation
  delay?: number
}

export interface ArrowElement {
  type: "arrow"
  from: Position
  to: Position
  color?: string
  label?: string
  animation_in?: AnimationIn
  delay?: number
}

export interface DividerElement {
  type: "divider"
  color?: string
  animation_in?: AnimationIn
  delay?: number
}

export interface CalloutElement {
  type: "callout"
  value: string
  accent?: string               // left border color
  position?: Position
  animation_in?: AnimationIn
  idle?: IdleAnimation
  delay?: number
}

// ─── Flow diagram ──────────────────────────────────────────

export interface FlowNode {
  id: string
  label: string
  accent?: boolean              // glowing highlight node
  color?: string
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
  animated?: boolean            // flowing dash animation
}

export interface FlowDiagramElement {
  type: "flow_diagram"
  nodes: FlowNode[]
  edges: FlowEdge[]
  direction?: "horizontal" | "vertical"
  position?: Position
  animation_in?: AnimationIn
  idle?: IdleAnimation
  delay?: number
}

// ─── Stack diagram ─────────────────────────────────────────

export interface StackLayer {
  label: string
  sublabel?: string
  color?: string                // layer accent color
  accent?: boolean              // highlight this layer
}

export interface StackDiagramElement {
  type: "stack_diagram"
  layers: StackLayer[]          // top to bottom order
  title?: string
  position?: Position
  animation_in?: AnimationIn
  idle?: IdleAnimation
  delay?: number
  stagger?: number
}

// ─── Split screen ──────────────────────────────────────────

export interface SplitPanel {
  label: string
  items: string[]
  color?: string                // panel accent color
  icon?: string                 // small label icon (text/emoji-free: use short ascii like ">")
}

export interface SplitScreenElement {
  type: "split_screen"
  left: SplitPanel
  right: SplitPanel
  title?: string
  position?: Position
  animation_in?: AnimationIn
  idle?: IdleAnimation
  delay?: number
}

// ─── Union ────────────────────────────────────────────────

export type SceneElement =
  | TextElement
  | CodeElement
  | CodeHighlightElement
  | BulletListElement
  | ImageElement
  | ArrowElement
  | DividerElement
  | CalloutElement
  | FlowDiagramElement
  | StackDiagramElement
  | SplitScreenElement

// ─── Background ───────────────────────────────────────────

export interface Background {
  type: BackgroundType
  color?: string
  gradient?: string[]
  language?: string
  theme?: "dark" | "light"
  star_count?: number
}

// ─── Scene ────────────────────────────────────────────────

export interface Scene {
  id: number
  duration: number
  background?: Background
  elements: SceneElement[]
  transition?: "cut" | "fade" | "slide"
}

// ─── Meta ─────────────────────────────────────────────────

export interface ReelMeta {
  title?: string
  aspect_ratio?: AspectRatio
  fps?: number
  background?: string
  font?: string
}

// ─── Root ─────────────────────────────────────────────────

export interface ReelSchema {
  meta: ReelMeta
  scenes: Scene[]
}