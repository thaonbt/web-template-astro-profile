const WORDS_PER_MINUTE = 200;

/** Estimate reading time in minutes from a raw markdown body (minimum 1). */
export function getReadingTime(markdown?: string): number {
  if (!markdown) return 1;

  const text = markdown
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks are skipped
    .replace(/`[^`]*`/g, " ") // inline code
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // keep link text and drop the URL
    .replace(/<[^>]+>/g, " ") // HTML tags
    .replace(/[#>*_~|-]+/g, " "); // markdown symbols

  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}