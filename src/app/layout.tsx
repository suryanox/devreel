import type { Metadata } from "next"
import "./globals.css"
import GitHubStar from "@/components/GitHubStar"

export const metadata: Metadata = {
  title: "DevReel Studio",
  description: "Create engaging dev reels",
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