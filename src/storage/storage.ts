import type { HistoryEntry, Settings } from '../types'

const settingsKey = 'json-lens-settings'
const historyKey = 'json-lens-history'
const pendingKey = 'pendingInput'

const defaultSettings: Settings = { theme: 'system', indent: '2', xmlRoot: 'root', xmlItem: 'item' }

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local)
}

export async function loadSettings(): Promise<Settings> {
  if (hasChromeStorage()) {
    const data = await chrome.storage.local.get(settingsKey)
    return { ...defaultSettings, ...(data[settingsKey] as Partial<Settings> | undefined) }
  }
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(settingsKey) ?? '{}') }
  } catch {
    return defaultSettings
  }
}

export async function saveSettings(settings: Settings) {
  if (hasChromeStorage()) return chrome.storage.local.set({ [settingsKey]: settings })
  localStorage.setItem(settingsKey, JSON.stringify(settings))
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  if (hasChromeStorage()) {
    const data = await chrome.storage.local.get(historyKey)
    return (data[historyKey] as HistoryEntry[] | undefined) ?? []
  }
  try {
    return JSON.parse(localStorage.getItem(historyKey) ?? '[]') as HistoryEntry[]
  } catch {
    return []
  }
}

export async function saveHistory(entries: HistoryEntry[]) {
  if (hasChromeStorage()) return chrome.storage.local.set({ [historyKey]: entries })
  localStorage.setItem(historyKey, JSON.stringify(entries))
}

export async function savePendingInput(value: string) {
  if (typeof chrome !== 'undefined' && chrome.storage?.session) return chrome.storage.session.set({ [pendingKey]: value })
  sessionStorage.setItem(pendingKey, value)
}

export async function loadPendingInput() {
  if (typeof chrome !== 'undefined' && chrome.storage?.session) {
    const data = await chrome.storage.session.get(pendingKey)
    if (data[pendingKey]) await chrome.storage.session.remove(pendingKey)
    return (data[pendingKey] as string | undefined) ?? ''
  }
  const value = sessionStorage.getItem(pendingKey) ?? ''
  sessionStorage.removeItem(pendingKey)
  return value
}

export { defaultSettings }
