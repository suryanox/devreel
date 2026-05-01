import type { Metadata } from "next"
import "./globals.css"
import GitHubStar from "@/components/GitHubStar"

export const metadata: Metadata = {
  title: "DevReel — AI-Powered Dev Reels",
  description: "Generate engaging developer reels from a simple schema",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ height: "100vh", overflow: "hidden", position: "relative" }}>
        <GitHubStar />
        {children}
      </body>
    </html>
  )
}