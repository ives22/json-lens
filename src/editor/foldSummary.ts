export type FoldLanguage = 'json' | 'xml' | 'yaml' | 'text'

function countJsonItems(source: string) {
  let depth = 0
  let count = 0
  let hasValue = false
  let inString = false
  let escaped = false

  for (const char of source) {
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') {
      inString = true
      hasValue = true
    } else if (char === '{' || char === '[') {
      depth += 1
      hasValue = true
    } else if (char === '}' || char === ']') {
      depth -= 1
    } else if (char === ',' && depth === 0) {
      count += 1
    } else if (!/\s/.test(char)) {
      hasValue = true
    }
  }

  return hasValue ? count + 1 : 0
}

function countXmlItems(source: string) {
  const tags = source.match(/<\/?[A-Za-z_][\w:.-]*(?:\s[^>]*)?>/g) ?? []
  let depth = 0
  let count = 0

  for (const tag of tags) {
    if (tag.startsWith('</')) {
      depth = Math.max(0, depth - 1)
    } else if (tag.endsWith('/>')) {
      if (depth === 0) count += 1
    } else {
      if (depth === 0) count += 1
      depth += 1
    }
  }

  return count
}

function countYamlItems(source: string) {
  const lines = source.split(/\r?\n/).filter((line) => line.trim() && !line.trim().startsWith('#'))
  if (lines.length === 0) return 0
  const baseIndent = Math.min(...lines.map((line) => line.match(/^\s*/)?.[0].length ?? 0))
  return lines.filter((line) => (line.match(/^\s*/)?.[0].length ?? 0) === baseIndent).length
}

export function countFoldItems(language: FoldLanguage, source: string) {
  if (language === 'json') return countJsonItems(source)
  if (language === 'xml') return countXmlItems(source)
  if (language === 'yaml') return countYamlItems(source)
  return 0
}
