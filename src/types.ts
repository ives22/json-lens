export type OutputMode = 'json' | 'xml' | 'yaml' | 'text'
export type ActionId = 'format' | 'minify' | 'validate' | 'sort' | 'xml' | 'yaml' | 'escape' | 'unescape'
export type SortDirection = 'asc' | 'desc'
export type ThemeMode = 'light' | 'dark' | 'system'

export interface ValidationResult {
  valid: boolean
  value?: unknown
  error?: string
  line?: number
  column?: number
}

export interface HistoryEntry {
  id: string
  name: string
  createdAt: number
  operation: string
  valid: boolean
  size: number
  content?: string
}

export interface Settings {
  theme: ThemeMode
  indent: '2' | '4' | 'tab'
  xmlRoot: string
  xmlItem: string
}
