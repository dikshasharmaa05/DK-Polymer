export const PLACEHOLDER_RE = /\[PLACEHOLDER[^\]]*\]/g;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Escape text and wrap every [PLACEHOLDER: …] in a visible marker. */
export function ph(text: string): string {
  return escapeHtml(text).replace(PLACEHOLDER_RE, (m) => `<mark class="ph" title="Open decision: answer needed from the business owner">${m}</mark>`);
}

export function hasPlaceholder(text: string): boolean {
  return new RegExp(PLACEHOLDER_RE.source).test(text);
}
