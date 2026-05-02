"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  "$ initializing runtime...",
  "$ loading modules [████████████] 100%",
  "$ connecting to dev environment...",
  "$ mount /usr/local/bin ✓",
  "$ environment ready.",
  "$ _",
];

export default function Terminal() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentChar, setCurrentChar] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setVisibleLines([]);
    setLineIndex(0);
    setCurrentChar(0);
  }, []);

  useEffect(() => {
    if (lineIndex >= BOOT_LINES.length) return;

    const line = BOOT_LINES[lineIndex];

    if (currentChar < line.length) {
      timeoutRef.current = setTimeout(() => {
        setVisibleLines((prev) => {
          const updated = [...prev];
          updated[lineIndex] = line.slice(0, currentChar + 1);
          return updated;
        });
        setCurrentChar((c) => c + 1);
      }, 28);
    } else {
      timeoutRef.current = setTimeout(() => {
        setLineIndex((l) => l + 1);
        setCurrentChar(0);
      }, 180);
    }

    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [lineIndex, currentChar]);

  return (
    <div className="terminal-bg">
      {/* Scanline overlay */}
      <div className="terminal-scanlines" />

      {/* Window chrome */}
      <div className="terminal-chrome">
        <div className="terminal-chrome-dots">
          <span className="code-dot code-dot--red" />
          <span className="code-dot code-dot--yellow" />
          <span className="code-dot code-dot--green" />
        </div>
        <span className="terminal-chrome-title">bash — 80×24</span>
      </div>

      {/* Terminal body */}
      <div className="terminal-body">
        {visibleLines.map((line, i) => (
          <div key={i} className="terminal-line">
            <span className="terminal-text">{line}</span>
            {i === visibleLines.length - 1 && lineIndex < BOOT_LINES.length && (
              <span className="terminal-cursor" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}