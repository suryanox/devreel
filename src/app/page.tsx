"use client"

import dynamic from "next/dynamic"
import Editor from "@/components/Editor"

const Preview = dynamic(() => import("@/components/Preview"), { ssr: false })

export default function Page() {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      background: "var(--bg-base)",
      overflow: "hidden",
    }}>
      <Editor />
      <Preview />
    </div>
  )
}