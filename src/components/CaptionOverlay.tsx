"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "@/store"

export default function CaptionOverlay() {
  const { activeCaptions, captionStyle, showCaptions } = useStore()
  const isYellow = captionStyle === "bold-yellow"
  const isKinetic = captionStyle === "kinetic"

  if (!showCaptions) return null

  return (
    <div style={{
      position: "absolute",
      bottom: 80,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      padding: "0 20px",
      zIndex: 25,
      pointerEvents: "none",
    }}>
     <AnimatePresence mode="wait">
  {activeCaptions.map((caption) => (
    <motion.div
      key={caption.id}
      initial={{ opacity: caption.id === "interim" ? 1 : 0, y: caption.id === "interim" ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      style={{
        textAlign: "center",
        fontSize: isYellow ? 22 : 18,
        fontWeight: isYellow ? 800 : 500,
        color: isYellow ? "var(--caption-yellow)" : "var(--caption-white)",
        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
        lineHeight: 1.4,
        letterSpacing: isYellow ? 0.5 : 0.2,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        maxWidth: "100%",
      }}
    >
      {caption.text}
    </motion.div>
  ))}
</AnimatePresence>
    </div>
  )
}