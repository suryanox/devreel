import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import GitHubStar from "@/components/GitHubStar";
import ExportButton from "@/components/ExportButton";

export default function Home() {
  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">DevReel</span>
          <span className="app-tagline">Schema → Preview → Export</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ExportButton />
          <GitHubStar />
        </div>
      </header>

      {/* Main */}
      <main className="app-main">
        <Editor />
        <Preview />
      </main>
    </div>
  );
}