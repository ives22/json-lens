function isContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === 'object' && value !== null
}

function isEmptyContainer(value: unknown) {
  return Array.isArray(value) ? value.length === 0 : isContainer(value) && Object.keys(value).length === 0
}

function safePlainString(value: string) {
  if (!value || value.trim() !== value || /[\r\n\t]/.test(value)) return false
  if (!/^[\p{L}\p{N} _./+-]+$/u.test(value)) return false
  if (/^(?:null|~|true|false|yes|no|on|off)$/i.test(value)) return false
  if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value)) return false
  return true
}

function scalar(value: unknown) {
  if (value === null) return 'null'
  if (typeof value === 'string') return safePlainString(value) ? value : JSON.stringify(value)
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  return JSON.stringify(value)
}

function key(value: string) {
  return /^[A-Za-z_][A-Za-z0-9_.-]*$/.test(value) ? value : JSON.stringify(value)
}

function render(value: unknown, depth: number, unit: string): string[] {
  const prefix = unit.repeat(depth)
  if (!isContainer(value)) return [`${prefix}${scalar(value)}`]

  if (Array.isArray(value)) {
    if (value.length === 0) return [`${prefix}[]`]
    return value.flatMap((item) => {
      if (!isContainer(item) || isEmptyContainer(item)) return [`${prefix}- ${isEmptyContainer(item) ? scalar(item) : scalar(item)}`]
      return [`${prefix}-`, ...render(item, depth + 1, unit)]
    })
  }

  const entries = Object.entries(value)
  if (entries.length === 0) return [`${prefix}{}`]
  return entries.flatMap(([name, child]) => {
    const label = `${prefix}${key(name)}:`
    if (!isContainer(child) || isEmptyContainer(child)) return [`${label} ${isEmptyContainer(child) ? scalar(child) : scalar(child)}`]
    return [label, ...render(child, depth + 1, unit)]
  })
}

export function jsonToYaml(value: unknown, indent: '2' | '4' | 'tab' = '2') {
  // YAML indentation cannot use tabs; keep the user's setting valid by falling back to two spaces.
  const unit = indent === '4' ? '    ' : '  '
  return render(value, 0, unit).join('\n')
}
