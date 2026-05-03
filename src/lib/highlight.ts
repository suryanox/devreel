import { createHighlighter } from "shiki"

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["one-dark-pro"],
      langs: ["rust", "typescript", "python", "c", "cpp", "bash", "json", "yaml"],
    })
  }
  return highlighterPromise
}

export async function highlight(
  code: string,
  lang: string = "rust"
): Promise<string> {
  const highlighter = await getHighlighter()
  const validLangs = ["rust", "typescript", "python", "c", "cpp", "bash", "json", "yaml"]
  const safeLang = validLangs.includes(lang) ? lang : "rust"
  return highlighter.codeToHtml(code, {
    lang: safeLang,
    theme: "one-dark-pro",
  })
}