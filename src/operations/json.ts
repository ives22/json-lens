import type { SortDirection, ValidationResult } from '../types'

function offsetToPosition(source: string, offset: number) {
  const before = source.slice(0, Math.max(0, offset))
  const lines = before.split('\n')
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 }
}

function findFallbackErrorOffset(source: string) {
  const missingValue = source.match(/:\s*([}\]])/)
  if (missingValue?.index !== undefined) return missingValue.index + missingValue[0].length - 1
  const trailingComma = source.match(/,\s*([}\]])/)
  if (trailingComma?.index !== undefined) return trailingComma.index + trailingComma[0].length - 1
  return Math.max(0, source.length - 1)
}

export function validateJson(source: string): ValidationResult {
  try {
    const value = JSON.parse(source)
    return { valid: true, value }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON 无效'
    const match = message.match(/position (\d+)/i)
    const position = offsetToPosition(source, match ? Number(match[1]) : findFallbackErrorOffset(source))
    return { valid: false, error: message, ...position }
  }
}

export function formatJson(source: string, indent: string) {
  const result = validateJson(source)
  if (!result.valid) return result
  const spacing = indent === 'tab' ? '\t' : Number(indent)
  return { valid: true, value: JSON.stringify(result.value, null, spacing) }
}

export function minifyJson(source: string) {
  const result = validateJson(source)
  if (!result.valid) return result
  return { valid: true, value: JSON.stringify(result.value) }
}

function sortValue(value: unknown, direction: SortDirection, recursive: boolean): unknown {
  if (Array.isArray(value)) return recursive ? value.map((item) => sortValue(item, direction, recursive)) : value
  if (!value || typeof value !== 'object') return value

  const entries = Object.entries(value).sort(([left], [right]) => {
    const result = left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
    return direction === 'asc' ? result : -result
  })
  return Object.fromEntries(entries.map(([key, item]) => [key, recursive ? sortValue(item, direction, recursive) : item]))
}

export function sortJson(source: string, indent: string, direction: SortDirection = 'asc', recursive = true) {
  const result = validateJson(source)
  if (!result.valid) return result
  const spacing = indent === 'tab' ? '\t' : Number(indent)
  return { valid: true, value: JSON.stringify(sortValue(result.value, direction, recursive), null, spacing) }
}

export function escapeJsonString(source: string) {
  return JSON.stringify(source).slice(1, -1)
}

export function unescapeJsonString(source: string) {
  try {
    return { valid: true, value: JSON.parse(`"${source}"`) }
  } catch {
    return { valid: false, error: '无法反转义：输入不是有效的 JSON 字符串内容' }
  }
}
