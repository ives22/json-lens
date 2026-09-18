function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function safeTagName(value: string, fallback: string) {
  const normalized = value.trim().replace(/[^A-Za-z0-9_.-]/g, '_')
  return /^[A-Za-z_]/.test(normalized) ? normalized : fallback
}

function renderNode(value: unknown, tag: string, depth: number, itemTag: string): string {
  const indent = '  '.repeat(depth)
  const childIndent = '  '.repeat(depth + 1)
  const name = safeTagName(tag, 'item')

  if (value === null) return `${indent}<${name}/>`
  if (typeof value !== 'object') return `${indent}<${name}>${escapeXml(String(value))}</${name}>`

  const entries = Array.isArray(value)
    ? value.map((item) => [itemTag, item] as const)
    : Object.entries(value)

  if (entries.length === 0) return `${indent}<${name}/>`
  const children = entries.map(([childName, child]) => renderNode(child, childName, depth + 1, itemTag)).join('\n')
  return `${indent}<${name}>\n${children}\n${indent}</${name}>`
}

export function jsonToXml(value: unknown, root = 'root', item = 'item') {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${renderNode(value, root, 0, item)}`
}
