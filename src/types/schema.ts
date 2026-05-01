export type AspectRatio = "9:16"
export type AnimationIn =
  | "fade_in"
  | "zoom_in"
  | "slide_up"
  | "slide_left"
  | "slide_right"
  | "type_in"
  | "pop_in"
  | "none"

export type AnimationOut =
  | "fade_out"
  | "zoom_out"
  | "slide_up"
  | "slide_down"
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

export type ElementType =
  | "text"
  | "code"
  | "bullet_list"
  | "image"
  | "arrow"
  | "divider"

export interface TextElement {
  type: "text"
  value: string
  style?: TextStyle
  position?: Position
  color?: string
  size?: number
  animation_in?: AnimationIn
  animation_out?: AnimationOut
  delay?: number
}

export interface CodeElement {
  type: "code"
  value: string
  language?: "rust" | "python" | "typescript" | "bash" | "json"
  highlight_lines?: number[]
  position?: Position
  animation_in?: AnimationIn
  animation_out?: AnimationOut
  delay?: number
}

export interface BulletListElement {
  type: "bullet_list"
  items: string[]
  position?: Position
  color?: string
  animation_in?: AnimationIn
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

export type SceneElement =
  | TextElement
  | CodeElement
  | BulletListElement
  | ImageElement
  | ArrowElement
  | DividerElement

export interface Background {
  type: BackgroundType
  color?: string
  gradient?: string[]
  language?: string
  theme?: "dark" | "light"
  star_count?: number
}

export interface Scene {
  id: number
  duration: number
  background?: Background
  elements: SceneElement[]
  transition?: "cut" | "fade" | "slide"
}

export interface ReelMeta {
  title?: string
  aspect_ratio?: AspectRatio
  fps?: number
  background?: string
  font?: string
}

export interface ReelSchema {
  meta: ReelMeta
  scenes: Scene[]
}