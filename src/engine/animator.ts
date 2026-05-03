import gsap from "gsap"
import type { AnimationIn, AnimationOut, IdleAnimation } from "@/types/schema"

// ─── Initial states ────────────────────────────────────────

export function getInitialState(animationIn: AnimationIn): gsap.TweenVars {
  switch (animationIn) {
    case "fade_in":    return { opacity: 0 }
    case "zoom_in":    return { opacity: 0, scale: 0.6 }
    case "slide_up":   return { opacity: 0, y: 50 }
    case "slide_left": return { opacity: 0, x: 70 }
    case "slide_right":return { opacity: 0, x: -70 }
    case "pop_in":     return { opacity: 0, scale: 0.05 }
    case "glitch":     return { opacity: 0 }
    case "draw_in":    return { opacity: 1 }
    case "type_in":    return { opacity: 1 }
    case "none":       return {}
    default:           return { opacity: 0 }
  }
}

// ─── Animate in ────────────────────────────────────────────

export function getAnimateInVars(
  animationIn: AnimationIn,
  duration: number
): gsap.TweenVars {
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
    case "glitch":
      return { ...base, opacity: 1, duration: 0.05 }
    case "draw_in":
      return { ...base, opacity: 1 }
    case "type_in":
      return { ...base, opacity: 1 }
    case "none":
      return {}
    default:
      return { ...base, opacity: 1 }
  }
}

// ─── Animate out ───────────────────────────────────────────

export function getAnimateOutVars(
  animationOut: AnimationOut,
  duration: number
): gsap.TweenVars {
  const base: gsap.TweenVars = { duration, ease: "power2.in" }

  switch (animationOut) {
    case "fade_out":  return { ...base, opacity: 0 }
    case "zoom_out":  return { ...base, opacity: 0, scale: 1.5 }
    case "slide_up":  return { ...base, opacity: 0, y: -60 }
    case "slide_down":return { ...base, opacity: 0, y: 60 }
    case "none":      return {}
    default:          return { ...base, opacity: 0 }
  }
}

// ─── animateIn ─────────────────────────────────────────────

export function animateIn(
  el: HTMLElement,
  animationIn: AnimationIn,
  delay: number = 0,
  duration: number = 0.6,
): gsap.core.Tween | void {
  if (animationIn === "glitch") {
    return glitchIn(el, delay)
  }

  if (animationIn === "draw_in") {
    drawIn(el, delay, duration)
    return
  }

  if (animationIn === "type_in") {
    const text = el.textContent || ""
    typeInAnimation(el, text, duration * 1.5, delay)
    return
  }

  const initial = getInitialState(animationIn)
  const target = getAnimateInVars(animationIn, duration)
  gsap.set(el, initial)
  return gsap.to(el, { ...target, delay })
}

// ─── animateOut ────────────────────────────────────────────

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

// ─── Glitch ────────────────────────────────────────────────

export function glitchIn(
  el: HTMLElement,
  delay: number = 0,
): gsap.core.Timeline {
  const tl = gsap.timeline({ delay })

  gsap.set(el, { opacity: 1 })

  // RGB split layers — create pseudo elements via box-shadow trick
  const glitchSteps = [
    { x: -4, skewX: 8,  opacity: 0.8, duration: 0.06 },
    { x:  4, skewX: -5, opacity: 0.6, duration: 0.05 },
    { x: -2, skewX: 3,  opacity: 0.9, duration: 0.07 },
    { x:  3, skewX: -8, opacity: 0.7, duration: 0.04 },
    { x: -1, skewX: 2,  opacity: 1.0, duration: 0.06 },
    { x:  0, skewX: 0,  opacity: 1.0, duration: 0.08 },
  ]

  glitchSteps.forEach((step) => {
    tl.to(el, {
      x: step.x,
      skewX: step.skewX,
      opacity: step.opacity,
      duration: step.duration,
      ease: "none",
      filter: step.x !== 0
        ? `drop-shadow(${step.x * 2}px 0 0 rgba(34,211,238,0.8)) drop-shadow(${-step.x * 2}px 0 0 rgba(168,85,247,0.8))`
        : "none",
    })
  })

  // Settle
  tl.to(el, {
    x: 0,
    skewX: 0,
    opacity: 1,
    filter: "none",
    duration: 0.1,
    ease: "power2.out",
  })

  return tl
}

// ─── Draw in (SVG stroke) ──────────────────────────────────

export function drawIn(
  el: HTMLElement,
  delay: number = 0,
  duration: number = 1.0,
) {
  const svgs = el.querySelectorAll<SVGPathElement | SVGLineElement>(
    "path, line, polyline, rect, circle, ellipse"
  )

  if (svgs.length === 0) {
    // Fallback to fade
    gsap.set(el, { opacity: 0 })
    gsap.to(el, { opacity: 1, duration, delay, ease: "power2.out" })
    return
  }

  svgs.forEach((svg, i) => {
    const length = (svg as SVGGeometryElement).getTotalLength?.() ?? 200
    gsap.set(svg, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 1,
    })
    gsap.to(svg, {
      strokeDashoffset: 0,
      duration,
      delay: delay + i * 0.1,
      ease: "power2.inOut",
    })
  })
}

// ─── Type in ──────────────────────────────────────────────

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
  const charDuration = duration / Math.max(chars.length, 1)
  let current = ""

  chars.forEach((char, i) => {
    gsap.delayedCall(delay + i * charDuration, () => {
      current += char
      el.textContent = current
      if (i === chars.length - 1) onComplete?.()
    })
  })
}

// ─── Stagger in ────────────────────────────────────────────

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

// ─── Idle animations ───────────────────────────────────────

export function applyIdleAnimation(
  el: HTMLElement,
  idle: IdleAnimation,
  delay: number = 0,
): gsap.core.Tween | gsap.core.Timeline | void {
  switch (idle) {
    case "float":
      return gsap.to(el, {
        y: "-=8",
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay,
      })

    case "float_3d":
      return gsap.to(el, {
        y: "-=6",
        rotateX: "+=3",
        rotateY: "-=2",
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay,
        transformPerspective: 600,
      })

    case "pulse": {
      const tl = gsap.timeline({ repeat: -1, delay })
      tl.to(el, {
        scale: 1.04,
        duration: 0.8,
        ease: "sine.inOut",
      }).to(el, {
        scale: 1,
        duration: 0.8,
        ease: "sine.inOut",
      })
      return tl
    }

    case "glow": {
      const tl = gsap.timeline({ repeat: -1, delay })
      tl.to(el, {
        filter: "drop-shadow(0 0 12px rgba(34,211,238,0.9))",
        duration: 1.2,
        ease: "sine.inOut",
      }).to(el, {
        filter: "drop-shadow(0 0 4px rgba(34,211,238,0.3))",
        duration: 1.2,
        ease: "sine.inOut",
      })
      return tl
    }

    case "none":
    default:
      return
  }
}

// ─── Kill helpers ──────────────────────────────────────────

export function killAll(el: HTMLElement) {
  gsap.killTweensOf(el)
}

export function createTimeline(sceneDuration: number): gsap.core.Timeline {
  return gsap.timeline({ duration: sceneDuration })
}