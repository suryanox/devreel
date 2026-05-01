import gsap from "gsap"
import type { AnimationIn, AnimationOut } from "@/types/schema"

export interface AnimationConfig {
  element: HTMLElement
  animationIn: AnimationIn
  animationOut: AnimationOut
  delay?: number
  duration?: number
  onComplete?: () => void
}

export function getInitialState(animationIn: AnimationIn): gsap.TweenVars {
  switch (animationIn) {
    case "fade_in":
      return { opacity: 0 }
    case "zoom_in":
      return { opacity: 0, scale: 0.5 }
    case "slide_up":
      return { opacity: 0, y: 60 }
    case "slide_left":
      return { opacity: 0, x: 80 }
    case "slide_right":
      return { opacity: 0, x: -80 }
    case "pop_in":
      return { opacity: 0, scale: 0.1 }
    case "type_in":
      return { opacity: 1 }
    case "none":
      return {}
    default:
      return { opacity: 0 }
  }
}

export function getAnimateInVars(animationIn: AnimationIn, duration: number): gsap.TweenVars {
  const base: gsap.TweenVars = { duration, ease: "power3.out" }

  switch (animationIn) {
    case "fade_in":
      return { ...base, opacity: 1 }
    case "zoom_in":
      return { ...base, opacity: 1, scale: 1, ease: "back.out(1.7)" }
    case "slide_up":
      return { ...base, opacity: 1, y: 0 }
    case "slide_left":
      return { ...base, opacity: 1, x: 0 }
    case "slide_right":
      return { ...base, opacity: 1, x: 0 }
    case "pop_in":
      return { ...base, opacity: 1, scale: 1, ease: "elastic.out(1, 0.5)" }
    case "type_in":
      return { ...base, opacity: 1 }
    case "none":
      return {}
    default:
      return { ...base, opacity: 1 }
  }
}

export function getAnimateOutVars(animationOut: AnimationOut, duration: number): gsap.TweenVars {
  const base: gsap.TweenVars = { duration, ease: "power2.in" }

  switch (animationOut) {
    case "fade_out":
      return { ...base, opacity: 0 }
    case "zoom_out":
      return { ...base, opacity: 0, scale: 1.5 }
    case "slide_up":
      return { ...base, opacity: 0, y: -60 }
    case "slide_down":
      return { ...base, opacity: 0, y: 60 }
    case "none":
      return {}
    default:
      return { ...base, opacity: 0 }
  }
}

export function animateIn(
  el: HTMLElement,
  animationIn: AnimationIn,
  delay: number = 0,
  duration: number = 0.6,
): gsap.core.Tween {
  const initial = getInitialState(animationIn)
  const target = getAnimateInVars(animationIn, duration)

  gsap.set(el, initial)
  return gsap.to(el, { ...target, delay })
}

export function animateOut(
  el: HTMLElement,
  animationOut: AnimationOut,
  delay: number = 0,
  duration: number = 0.4,
  onComplete?: () => void,
): gsap.core.Tween {
  const target = getAnimateOutVars(animationOut, duration)
  return gsap.to(el, { ...target, delay, onComplete })
}

export function typeInAnimation(
  el: HTMLElement,
  text: string,
  duration: number,
  delay: number = 0,
  onComplete?: () => void,
) {
  el.textContent = ""
  gsap.set(el, { opacity: 1 })

  const chars = text.split("")
  const charDuration = duration / chars.length
  let current = ""

  chars.forEach((char, i) => {
    gsap.delayedCall(delay + i * charDuration, () => {
      current += char
      el.textContent = current
      if (i === chars.length - 1) onComplete?.()
    })
  })
}

export function staggerIn(
  elements: HTMLElement[],
  animationIn: AnimationIn,
  stagger: number = 0.15,
  delay: number = 0,
  duration: number = 0.5,
): gsap.core.Tween {
  elements.forEach(el => gsap.set(el, getInitialState(animationIn)))
  return gsap.to(elements, {
    ...getAnimateInVars(animationIn, duration),
    stagger,
    delay,
  })
}

export function killAll(el: HTMLElement) {
  gsap.killTweensOf(el)
}

export function createTimeline(sceneDuration: number): gsap.core.Timeline {
  return gsap.timeline({ duration: sceneDuration })
}