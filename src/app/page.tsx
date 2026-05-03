import Editor from "@/components/Editor"
import Preview from "@/components/Preview"
import GitHubStar from "@/components/GitHubStar"

export default function Home() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">DevReel</span>
          <span className="app-tagline">yaml → reel</span>
        </div>
        <GitHubStar />
      </header>

      <main className="app-main">
        <Editor />
        <Preview />
      </main>
    </div>
  )
}