import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert Markdown to a plain single-line preview string
export function stripMarkdown(markdown: string): string {
  if (!markdown) return ""
  let text = markdown
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // Remove inline code
    .replace(/`[^`]*`/g, " ")
    // Remove images ![alt](url)
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, "$1")
    // Headings, blockquotes, list markers, checkboxes
    .replace(/^\s{0,3}(#{1,6}|>|-|\*|\+|\d+\.)\s+/gm, "")
    .replace(/\s*\[( |x|X)\]\s+/g, " ")
    // Emphasis/bold/strikethrough markers
    .replace(/([*_~]{1,3})(\S.*?\S?)\1/g, "$2")
    // Horizontal rules
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, " ")
    // Line breaks -> space
    .replace(/[\r\n]+/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim()

  return text
}
