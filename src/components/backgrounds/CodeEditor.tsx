"use client";

const CODE_LINES = [
  { indent: 0, tokens: [{ text: "use ", c: "#c792ea" }, { text: "axum::{Router, Json}", c: "#eeffff" }, { text: ";", c: "#89ddff" }] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [{ text: "#[tokio::main]", c: "#c792ea" }] },
  { indent: 0, tokens: [{ text: "async fn ", c: "#c792ea" }, { text: "main", c: "#82aaff" }, { text: "() {", c: "#cdd3de" }] },
  { indent: 1, tokens: [{ text: "let ", c: "#c792ea" }, { text: "app", c: "#eeffff" }, { text: " = ", c: "#89ddff" }, { text: "Router::new()", c: "#82aaff" }] },
  { indent: 2, tokens: [{ text: ".route(", c: "#cdd3de" }, { text: '"/health"', c: "#c3e88d" }, { text: ", get(health));", c: "#cdd3de" }] },
  { indent: 0, tokens: [] },
  { indent: 1, tokens: [{ text: "axum::serve(", c: "#82aaff" }, { text: "listener, app)", c: "#eeffff" }] },
  { indent: 2, tokens: [{ text: ".await", c: "#c792ea" }, { text: ".unwrap();", c: "#cdd3de" }] },
  { indent: 0, tokens: [{ text: "}", c: "#cdd3de" }] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [{ text: "async fn ", c: "#c792ea" }, { text: "health", c: "#82aaff" }, { text: "() -> Json<&'static str> {", c: "#cdd3de" }] },
  { indent: 1, tokens: [{ text: "Json", c: "#ffcb6b" }, { text: '("ok")', c: "#c3e88d" }] },
  { indent: 0, tokens: [{ text: "}", c: "#cdd3de" }] },
];

const ACTIVITY_ICONS = [
  <svg key="files" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  <svg key="search" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  <svg key="git" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>,
  <svg key="ext" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 2l-4 5-4-5"/></svg>,
];

export default function CodeEditor() {
  return (
    <div className="code-editor-bg">
      <div className="ce-activity-bar">
        {ACTIVITY_ICONS.map((icon, i) => (
          <div key={i} className={`ce-activity-icon ${i === 0 ? "ce-activity-icon--active" : ""}`}>
            {icon}
          </div>
        ))}
      </div>
      <div className="ce-sidebar">
        <div className="ce-sidebar-title">EXPLORER</div>
        {["src/", "  main.rs", "  routes.rs", "  config.rs", "Cargo.toml"].map((file, i) => (
          <div key={i} className={`ce-file-item ${file.trim() === "main.rs" ? "ce-file-item--active" : ""}`}>
            {file}
          </div>
        ))}
      </div>
      <div className="ce-editor">
        <div className="ce-tabs">
          <div className="ce-tab ce-tab--active">main.rs</div>
          <div className="ce-tab">routes.rs</div>
        </div>
        <div className="ce-code-area">
          {CODE_LINES.map((line, i) => (
            <div key={i} className="ce-line">
              <span className="ce-line-number">{i + 1}</span>
              <span className="ce-line-content" style={{ paddingLeft: `${line.indent * 14}px` }}>
                {line.tokens.map((t, j) => (
                  <span key={j} style={{ color: t.c }}>{t.text}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="ce-status-bar">
        <span>⎇ main</span>
        <span>Rust</span>
        <span>UTF-8</span>
      </div>
      <div className="ce-overlay" />
    </div>
  );
}
