# DevReel

DevReel is a schema-driven reel generator for developer education content.

The product is for making short 9:16 dev reels about coding, AI, tools, code editing, terminal workflows, algorithms, runtime concepts, and technical explanations. A user writes a YAML schema, DevReel parses it into scenes, and the preview renders animated foreground elements on a simple video canvas.

The current direction is intentionally minimal: backgrounds should not carry the reel. The foreground elements do the teaching.

## Product Shape

DevReel is built around this workflow:

1. Write a YAML reel schema in the editor.
2. Parse the schema into typed scenes.
3. Render a 9:16 preview canvas.
4. Animate foreground elements with GSAP.
5. Export the reel as MP4 through FFmpeg WASM.

The tool should feel like a lightweight technical storytelling canvas, not a slide deck builder and not a heavy hacker UI. The visual system should favor clear foreground objects: code cards, text, callouts, stacks, flows, trees, split views, ranking cards, and diagrams.

## Current Design Rules

- Only one background type is supported: `solid`.
- Users can pass `color: black` or `color: grey`.
- `black` maps to a dark canvas.
- `grey` maps to a soft dark grey canvas.
- There are no animated or decorative background components.
- Do not reintroduce IDE, terminal, blackboard, whiteboard, graph, grid, space, circuit, or gradient backgrounds as scene backgrounds.
- If a reel needs an IDE, terminal, graph, tree, or stack, represent it as a foreground element, not as a background.
- Foreground visuals should be clean, readable, and purpose-built for explanation.

## Tech Stack

- Next.js App Router with TypeScript
- React client components
- Zustand for editor and preview state
- js-yaml for YAML parsing
- GSAP for animation
- Shiki for syntax highlighting
- FFmpeg WASM for video export
- lucide-react for UI icons

## Project Structure

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    Editor.tsx
    Preview.tsx
    SceneRenderer.tsx
    ExportButton.tsx
    GitHubStar.tsx
  engine/
    parser.ts
    animator.ts
    renderer.ts
  hooks/
    useEngine.ts
    useFFmpeg.ts
  lib/
    highlight.ts
  store/
    index.ts
  types/
    schema.ts
```

There is no active `src/components/backgrounds/` system anymore.

## Schema Overview

Root schema:

```yaml
meta:
  title: "Why main() is the entry point"
  aspect_ratio: "9:16"
  fps: 30
  font: "mono"

scenes:
  - id: 1
    duration: 5
    background:
      type: solid
      color: black
    elements: []
```

Supported background:

```yaml
background:
  type: solid
  color: black
```

```yaml
background:
  type: solid
  color: grey
```

## Supported Elements

### Text

```yaml
- type: text
  value: "But why main()?"
  style: title
  position: bottom
  highlight_token: "main()"
  highlight_color: "#ffb703"
  animation_in: zoom_in
```

Text styles:

- `hook`
- `title`
- `subtitle`
- `body`
- `caption`
- `code_label`

### Code

```yaml
- type: code
  value: |
    int main() {
        return 0;
    }
  language: cpp
  position: center
  animation_in: type_in
```

Supported languages:

- `rust`
- `python`
- `typescript`
- `bash`
- `json`
- `c`
- `cpp`

### Code Highlight

```yaml
- type: code_highlight
  value: |
    fn main() {
        println!("hello");
    }
  language: rust
  highlight_token: "main"
  highlight_color: "#ffb703"
  position: center
  animation_in: fade_in
```

### Callout

```yaml
- type: callout
  value: "main() is where control is handed to your program"
  accent: "#ffb703"
  position: center
  animation_in: pop_in
```

### Stack Diagram

```yaml
- type: stack_diagram
  title: "What really happens first"
  position: center
  animation_in: slide_up
  stagger: 0.2
  layers:
    - label: "main()"
      sublabel: "your function"
      color: "#ffb703"
      accent: true
    - label: "runtime setup"
      sublabel: "args, memory, startup"
      color: "#8ecae6"
    - label: "_start"
      sublabel: "real entry from the loader"
      color: "#90be6d"
```

### Flow Diagram

```yaml
- type: flow_diagram
  direction: vertical
  position: center
  animation_in: fade_in
  nodes:
    - id: loader
      label: "OS loader"
      color: "#8ecae6"
    - id: runtime
      label: "runtime setup"
      color: "#ffb703"
    - id: main
      label: "main()"
      color: "#fb8500"
      accent: true
  edges:
    - from: loader
      to: runtime
      label: "bootstrap"
      animated: true
    - from: runtime
      to: main
      label: "handoff"
      animated: true
```

### Tree Diagram

```yaml
- type: tree_diagram
  title: "Without main()"
  position: center
  animation_in: slide_up
  nodes:
    - label: "program launch"
      color: "#8ecae6"
      accent: true
      children:
        - label: "runtime looks for entry point"
          color: "#90be6d"
          children:
            - label: "no main() found"
              color: "#fb8500"
              accent: true
            - label: "startup fails"
              color: "#f28482"
```

### Split Screen

```yaml
- type: split_screen
  title: "The mental model"
  position: center
  animation_in: slide_up
  left:
    label: "before"
    icon: ">"
    color: "#f28482"
    items:
      - "program begins in your file"
      - "main() is the first instruction"
  right:
    label: "after"
    icon: ">"
    color: "#8ecae6"
    items:
      - "startup code runs first"
      - "main() is your handoff point"
```

### Ranking Cards

```yaml
- type: ranking_cards
  title: "Search results"
  position: center
  animation_in: slide_up
  items:
    - title: "runtime startup"
      subtitle: "closest match"
      score: "0.94"
      badge: "top"
      color: "#8ecae6"
      accent: true
    - title: "token overlap"
      subtitle: "weaker match"
      score: "0.61"
      badge: "fallback"
      color: "#f28482"
```

### Bullet List

```yaml
- type: bullet_list
  items:
    - "runtime prepares the process"
    - "control is handed to main()"
    - "your code starts there"
  position: center
  animation_in: slide_up
  stagger: 0.2
```

### Image, Divider, Arrow

These are still present in the schema, but they are secondary primitives.

## Supported Values

Positions:

- `center`
- `top`
- `bottom`
- `top_left`
- `top_right`
- `bottom_left`
- `bottom_right`

Entrance animations:

- `fade_in`
- `zoom_in`
- `slide_up`
- `slide_left`
- `slide_right`
- `type_in`
- `pop_in`
- `glitch`
- `draw_in`
- `none`

Idle animations:

- `float`
- `float_3d`
- `pulse`
- `glow`
- `none`

## Key Implementation Notes

- `parseSchema` should never throw. It returns `{ schema, error }`.
- Scene element validation lives in `src/engine/parser.ts`.
- Shared schema types live in `src/types/schema.ts`.
- Rendering happens in `src/components/SceneRenderer.tsx`.
- Styling lives in `src/app/globals.css`.
- Code highlighting is async through Shiki, so code elements wait for highlighted HTML before entrance animation.
- GSAP owns scene animations. CSS animations are limited to small supporting effects.
- The preview canvas is raw 9:16 output without phone chrome.

## Product Priority

The main priority is making foreground explanation primitives feel strong enough for dev education reels:

- code editor foreground cards
- terminal foreground cards
- clean text hierarchy
- strong code highlighting
- readable flow diagrams
- readable stack diagrams
- tree diagrams for structured concepts
- cards for search results, metrics, and comparisons
- split views for before/after or myth/reality scenes

The tool should help creators explain technical ideas visually without needing to manually record a screen or design slides from scratch.
