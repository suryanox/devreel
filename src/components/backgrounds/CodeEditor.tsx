"use client";

const FAKE_CODE_LINES = [
  { indent: 0, tokens: [{ text: "fn ", color: "#c792ea" }, { text: "main", color: "#82aaff" }, { text: "()", color: "#89ddff" }, { text: " {", color: "#cdd3de" }] },
  { indent: 1, tokens: [{ text: "let ", color: "#c792ea" }, { text: "msg", color: "#eeffff" }, { text: ": ", color: "#89ddff" }, { text: "&str", color: "#ffcb6b" }, { text: " = ", color: "#89ddff" }, { text: '"hello, world"', color: "#c3e88d" }, { text: ";", color: "#cdd3de" }] },
  { indent: 1, tokens: [{ text: "let ", color: "#c792ea" }, { text: "count", color: "#eeffff" }, { text: ": ", color: "#89ddff" }, { text: "u32", color: "#ffcb6b" }, { text: " = ", color: "#89ddff" }, { text: "42", color: "#f78c6c" }, { text: ";", color: "#cdd3de" }] },
  { indent: 0, tokens: [] },
  { indent: 1, tokens: [{ text: "for ", color: "#c792ea" }, { text: "i", color: "#eeffff" }, { text: " in ", color: "#c792ea" }, { text: "0", color: "#f78c6c" }, { text: "..", color: "#89ddff" }, { text: "count", color: "#eeffff" }, { text: " {", color: "#cdd3de" }] },
  { indent: 2, tokens: [{ text: "println!", color: "#82aaff" }, { text: "(", color: "#cdd3de" }, { text: '"{}: {}"', color: "#c3e88d" }, { text: ", i, msg);", color: "#cdd3de" }] },
  { indent: 1, tokens: [{ text: "}", color: "#cdd3de" }] },
  { indent: 0, tokens: [{ text: "}", color: "#cdd3de" }] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [{ text: "#[derive(", color: "#c792ea" }, { text: "Debug, Clone", color: "#ffcb6b" }, { text: ")]", color: "#c792ea" }] },
  { indent: 0, tokens: [{ text: "struct ", color: "#c792ea" }, { text: "Config", color: "#ffcb6b" }, { text: " {", color: "#cdd3de" }] },
  { indent: 1, tokens: [{ text: "verbose", color: "#eeffff" }, { text: ": ", color: "#89ddff" }, { text: "bool", color: "#ffcb6b" }, { text: ",", color: "#cdd3de" }] },
  { indent: 1, tokens: [{ text: "retries", color: "#eeffff" }, { text: ": ", color: "#89ddff" }, { text: "u8", color: "#ffcb6b" }, { text: ",", color: "#cdd3de" }] },
  { indent: 0, tokens: [{ text: "}", color: "#cdd3de" }] },
];

export default function CodeEditor() {
  return (
    <div className="code-editor-bg">
      {/* Activity bar */}
      <div className="ce-activity-bar">
        {["⬡", "⎘", "⚲", "⬢", "⚙"].map((icon, i) => (
          <div key={i} className={`ce-activity-icon ${i === 0 ? "ce-activity-icon--active" : ""}`}>
            {icon}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="ce-sidebar">
        <div className="ce-sidebar-title">EXPLORER</div>
        {["src", "  main.rs", "  lib.rs", "  config.rs", "Cargo.toml", ".gitignore"].map((file, i) => (
          <div
            key={i}
            className={`ce-file-item ${file.trim() === "main.rs" ? "ce-file-item--active" : ""}`}
          >
            {file}
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div className="ce-editor">
        {/* Tab bar */}
        <div className="ce-tabs">
          <div className="ce-tab ce-tab--active">main.rs</div>
          <div className="ce-tab">lib.rs</div>
        </div>

        {/* Code lines */}
        <div className="ce-code-area">
          {FAKE_CODE_LINES.map((line, i) => (
            <div key={i} className="ce-line">
              <span className="ce-line-number">{i + 1}</span>
              <span className="ce-line-content" style={{ paddingLeft: `${line.indent * 16}px` }}>
                {line.tokens.map((token, j) => (
                  <span key={j} style={{ color: token.color }}>{token.text}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="ce-status-bar">
        <span>⎇ main</span>
        <span>Rust</span>
        <span>UTF-8</span>
        <span>Ln 1, Col 1</span>
      </div>

      {/* Dim overlay so scene elements are readable */}
      <div className="ce-overlay" />
    </div>
  );
}