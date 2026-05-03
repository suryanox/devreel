# DevReel — AI-Powered Dev Reel Generator

## What We're Building
A web tool where devs write a YAML/JSON schema describing their reel, paste it into an editor, and the engine renders it as a 9:16 video canvas. No manual recording. Schema → Preview → Export.

## How It Works
1. User writes schema (or asks AI to generate one)
2. Pastes into left panel editor
3. Engine parses schema, renders scenes with animations
4. User previews scene by scene on a clean 9:16 canvas
5. Exports as MP4 via FFmpeg WASM

## Tech Stack
- **Next.js 15** (App Router, TypeScript)
- **GSAP** — animation engine (animateIn, staggerIn, idle animations)
- **Shiki** — VS Code-quality syntax highlighting
- **FFmpeg WASM** (@ffmpeg/ffmpeg) — video export
- **Zustand** — state management
- **js-yaml** — schema parsing
- **Space Grotesk** — display font
- **JetBrains Mono** — code font
- **lucide-react** — icons

## Project Structure

src/
├── app/
│   ├── globals.css         ✅ all styles live here
│   ├── layout.tsx          ✅
│   └── page.tsx            ✅ root layout — Editor + Preview
├── components/
│   ├── Editor.tsx          ✅ left panel schema editor
│   ├── Preview.tsx         ✅ right panel, 9:16 canvas, scene controls
│   ├── SceneRenderer.tsx   ✅ renders scene bg + elements + animations
│   ├── ExportButton.tsx    ✅ FFmpeg export UI
│   ├── GitHubStar.tsx      ✅
│   └── backgrounds/
│       ├── Gradient.tsx    ✅ animated gradient
│       ├── Terminal.tsx    ✅ typewriter terminal with scanlines
│       ├── Blackboard.tsx  ✅ canvas chalk board
│       ├── CodeEditor.tsx  ✅ VS Code style background
│       ├── Space.tsx       ✅ canvas starfield warp
│       ├── Grid3D.tsx      ✅ synthwave perspective grid (canvas)
│       └── Circuit.tsx     ✅ animated circuit traces (canvas)
├── engine/
│   ├── parser.ts           ✅ YAML/JSON → ReelSchema with validation
│   ├── animator.ts         ✅ GSAP animation helpers + idle animations
│   └── renderer.ts         ✅ scene orchestrator
├── hooks/
│   ├── useEngine.ts        ✅ wires parser to store
│   └── useFFmpeg.ts        ✅ FFmpeg WASM export pipeline
├── lib/
│   └── highlight.ts        ✅ Shiki highlighter singleton + cache
├── store/
│   └── index.ts            ✅ Zustand store
└── types/
    └── schema.ts           ✅ all TypeScript types

## Store API
```ts
const {
  schema,
  rawInput,
  parseError,
  currentScene,
  isPlaying,
  isExporting,
  exportProgress,
  exportStage,

  setSchema,
  setRawInput,
  setParseError,
  setCurrentScene,
  setIsPlaying,
  setIsExporting,
  setExportProgress,
  setExportStage,
} = useStore()
```
---

```md
## Parser API
```ts
const { schema, error } = parseSchema(rawInput)
animateIn(el, animationIn, delay, duration)
animateOut(el, animationOut, delay, duration, onComplete)
staggerIn(elements[], animationIn, stagger, delay, duration)
applyIdleAnimation(el, idle, delay)
glitchIn(el, delay)
drawIn(el, delay, duration)
typeInAnimation(el, text, duration, delay, onComplete)
```


---

```md
## Highlighter API
```ts
const html = await highlight(code, lang)

---

```md
## Schema Format (Part 1)
```yaml
meta:
  title: "Why Every Program Starts From main()"
  aspect_ratio: "9:16"
  fps: 30
  background: "#080810"

scenes:
  - id: 1
    duration: 4
    background:
      type: grid_3d
    elements:
      - type: text
        value: "Who called this?"
        style: hook
        position: center
        animation_in: zoom_in
        animation_out: fade_out
        idle: float
        delay: 0.3


---

```md
## CSS Notes
- All styles in `globals.css`
- No CSS animations for scene elements (GSAP only)
- 9:16 raw canvas (no phone chrome)
- Shiki async — wait before animating
- Kill GSAP tweens on cleanup

## Schema Format (Part 2)
```yaml
      - type: code_highlight
        language: rust
        value: |
          fn main() {
              println!("hello");
          }
        highlight_token: "main"
        highlight_color: "#facc15"
        position: center
        animation_in: fade_in
        idle: float_3d
        delay: 0.5

      - type: bullet_list
        items: ["point 1", "point 2", "point 3"]
        stagger: 0.3
        animation_in: slide_up
        position: center
        delay: 0.4

      - type: flow_diagram
        direction: horizontal
        position: center
        animation_in: fade_in
        nodes:
          - id: os
            label: "OS"
            color: "#f472b6"
          - id: start
            label: "_start"
            accent: true
            color: "#22d3ee"
        edges:
          - from: os
            to: start
            animated: true
            label: "calls"

      - type: stack_diagram
        position: center
        stagger: 0.2
        layers:
          - label: "main()"
            sublabel: "your code starts here"
            color: "#22d3ee"
            accent: true
          - label: "C Runtime"
            sublabel: "init stack + heap"
            color: "#6366f1"

      - type: split_screen
        position: center
        left:
          label: "C / C++"
          color: "#6366f1"
          icon: ">"
          items: ["_start -> crt0", "call main()"]
        right:
          label: "Rust"
          color: "#22d3ee"
          icon: ">"
          items: ["lang_start", "call main()"]

      - type: callout
        value: "_start is set by the linker, not you"
        accent: "#22d3ee"
        position: bottom
        animation_in: fade_in
        delay: 1.2


## CSS Architecture

**Layout**
- `.app-layout`, `.app-header`, `.app-main`
- `.canvas-wrapper`, `.canvas-frame`

**Scene**
- `.scene-root`
- `.scene-bg`
- `.scene-elements-layer`

**Position**
- `.el-pos--center`
- `.el-pos--top`
- `.el-pos--bottom`
- `.el-pos--top-left/right`
- `.el-pos--bottom-left/right`

**Text**
- `.text-hook`
- `.text-title`
- `.text-subtitle`
- `.text-body`
- `.text-caption`
- `.text-code-label`

**Components**
- `.code-block`, `.code-shiki`
- `.bullet-list`, `.bullet-item`
- `.flow-diagram`, `.flow-node`
- `.stack-diagram`, `.stack-layer`
- `.split-screen`, `.split-panel`
- `.callout`

**Backgrounds**
- `.grid3d-bg`
- `.circuit-bg`
- `.terminal-bg`
- `.space-bg`
- `.blackboard-bg`
- `.code-editor-bg`


## CSS Variables
```css
--bg, --bg-surface, --bg-elevated
--surface, --surface-2
--border, --border-2, --border-glow
--text, --text-primary, --text-secondary, --text-muted
--accent, --accent-2
--neon-cyan, --neon-purple, --neon-green, --neon-yellow
--font-display, --font-mono
--radius, --radius-md, --radius-lg
--perspective


---

```md
## Key Decisions
- No phone chrome (raw canvas export)
- Shiki cached highlighting
- GSAP for all animations
- Zustand store (useStore)
- Parser never throws
- Scene remount via key
- Async highlight before animation

## Content Focus
- Why systems behave a certain way
- Memory & runtime internals
- GenAI concepts
- Language comparisons

## Scene Design
- Hook → grid_3d / space
- Concept → circuit / gradient
- Code → terminal / code_editor
- Comparison → split_screen
- Summary → glow text
- CTA → grid + callout

## Known Issues
- Zustand setter is not callback-based
- Center positioning uses left/right, not translateX
- Avoid transform on code blocks
- Shiki async delay
- Canvas backgrounds don’t auto-resize
- Always kill GSAP idle tweens

