import type { ReelSchema, Scene, SceneElement } from "@/types/schema"
import { animateIn, animateOut, typeInAnimation, staggerIn, getInitialState } from "./animator"
import gsap from "gsap"

export interface RendererState {
  currentSceneIndex: number
  isPlaying: boolean
  elapsed: number
  timeline: gsap.core.Timeline | null
}

export class ReelRenderer {
  private schema: ReelSchema
  private containerEl: HTMLElement
  private state: RendererState
  private onSceneChange?: (index: number) => void
  private onComplete?: () => void
  private sceneTimeout?: ReturnType<typeof setTimeout>

  constructor(
    schema: ReelSchema,
    containerEl: HTMLElement,
    callbacks?: {
      onSceneChange?: (index: number) => void
      onComplete?: () => void
    }
  ) {
    this.schema = schema
    this.containerEl = containerEl
    this.state = {
      currentSceneIndex: 0,
      isPlaying: false,
      elapsed: 0,
      timeline: null,
    }
    this.onSceneChange = callbacks?.onSceneChange
    this.onComplete = callbacks?.onComplete
  }

  play() {
    this.state.isPlaying = true
    this.playScene(this.state.currentSceneIndex)
  }

  pause() {
    this.state.isPlaying = false
    this.state.timeline?.pause()
    if (this.sceneTimeout) clearTimeout(this.sceneTimeout)
  }

  resume() {
    this.state.isPlaying = true
    this.state.timeline?.resume()
  }

  goToScene(index: number) {
    if (this.sceneTimeout) clearTimeout(this.sceneTimeout)
    this.state.timeline?.kill()
    this.state.currentSceneIndex = index
    this.onSceneChange?.(index)
    if (this.state.isPlaying) {
      this.playScene(index)
    }
  }

  stop() {
    this.state.isPlaying = false
    if (this.sceneTimeout) clearTimeout(this.sceneTimeout)
    this.state.timeline?.kill()
  }

  destroy() {
    this.stop()
    gsap.killTweensOf(this.containerEl)
  }

  private playScene(index: number) {
    const scene = this.schema.scenes[index]
    if (!scene) {
      this.onComplete?.()
      return
    }

    this.onSceneChange?.(index)

    const sceneEl = this.containerEl.querySelector(`[data-scene="${scene.id}"]`) as HTMLElement
    if (!sceneEl) return

    const tl = gsap.timeline()
    this.state.timeline = tl

    gsap.set(sceneEl, { opacity: 1, display: "flex" })

    const elementEls = sceneEl.querySelectorAll("[data-element]")
    elementEls.forEach((el, i) => {
      const htmlEl = el as HTMLElement
      const animIn = htmlEl.dataset.animIn as any || "fade_in"
      const delay = parseFloat(htmlEl.dataset.delay || "0")

      if (animIn === "type_in") {
        const text = htmlEl.dataset.text || htmlEl.textContent || ""
        typeInAnimation(htmlEl, text, 1.2, delay)
      } else {
        gsap.set(htmlEl, getInitialState(animIn))
        tl.to(htmlEl, {
          ...getAnimationTarget(animIn),
          delay,
          duration: 0.6,
          ease: "power3.out",
        }, delay)
      }
    })

    this.sceneTimeout = setTimeout(() => {
      this.outroScene(sceneEl, scene, index)
    }, scene.duration * 1000 - 400)
  }

  private outroScene(sceneEl: HTMLElement, scene: Scene, index: number) {
    const elementEls = sceneEl.querySelectorAll("[data-element]")
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(sceneEl, { display: "none" })
        const next = index + 1
        if (next < this.schema.scenes.length && this.state.isPlaying) {
          this.state.currentSceneIndex = next
          this.playScene(next)
        } else {
          this.onComplete?.()
        }
      }
    })

    elementEls.forEach((el) => {
      const htmlEl = el as HTMLElement
      const animOut = htmlEl.dataset.animOut as any || "fade_out"
      tl.to(htmlEl, {
        ...getAnimationOutTarget(animOut),
        duration: 0.3,
        ease: "power2.in",
      }, 0)
    })
  }
}

function getAnimationTarget(animIn: string): gsap.TweenVars {
  switch (animIn) {
    case "fade_in": return { opacity: 1 }
    case "zoom_in": return { opacity: 1, scale: 1 }
    case "slide_up": return { opacity: 1, y: 0 }
    case "slide_left": return { opacity: 1, x: 0 }
    case "slide_right": return { opacity: 1, x: 0 }
    case "pop_in": return { opacity: 1, scale: 1 }
    default: return { opacity: 1 }
  }
}

function getAnimationOutTarget(animOut: string): gsap.TweenVars {
  switch (animOut) {
    case "fade_out": return { opacity: 0 }
    case "zoom_out": return { opacity: 0, scale: 1.3 }
    case "slide_up": return { opacity: 0, y: -40 }
    case "slide_down": return { opacity: 0, y: 40 }
    default: return { opacity: 0 }
  }
}