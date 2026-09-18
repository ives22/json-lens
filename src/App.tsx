import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodeEditor, type CodeEditorHandle } from './editor/CodeEditor'
import { formatJson, jsonToXml, jsonToYaml, minifyJson, sortJson, unescapeJsonString, escapeJsonString, validateJson } from './operations'
import { loadHistory, loadPendingInput, loadSettings, saveHistory, saveSettings } from './storage/storage'
import { HistoryPanel } from './components/HistoryPanel'
import { IndentControl, OutputActions, Toolbar, XmlControls } from './components/Toolbar'
import type { ActionId, HistoryEntry, OutputMode, Settings, SortDirection, ThemeMode } from './types'

const starterJson = '{\n  "project": "JSON Lens",\n  "features": ["format", "convert", "inspect"],\n  "local": true\n}'

function themeIsDark(theme: ThemeMode) {
  return theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
}

function download(content: string, extension: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `json-lens-${new Date().toISOString().slice(0, 10)}.${extension}`
  link.click()
  URL.revokeObjectURL(url)
}

export function App() {
  const [input, setInput] = useState(starterJson)
  const [output, setOutput] = useState(starterJson)
  const [mode, setMode] = useState<OutputMode>('json')
  const [activeAction, setActiveAction] = useState<ActionId>('format')
  const [status, setStatus] = useState('就绪')
  const [settings, setSettings] = useState<Settings>({ theme: 'system', indent: '2', xmlRoot: 'root', xmlItem: 'item' })
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [dark, setDark] = useState(false)
  const [toast, setToast] = useState('')
  const inputEditorRef = useRef<CodeEditorHandle>(null)
  const outputEditorRef = useRef<CodeEditorHandle>(null)
  const toastTimerRef = useRef<number | null>(null)

  useEffect(() => {
    void Promise.all([loadSettings(), loadHistory(), loadPendingInput()]).then(([loadedSettings, loadedHistory, pending]) => {
      setSettings(loadedSettings)
      setHistory(loadedHistory)
      if (pending) {
        setInput(pending)
        setOutput(pending)
        setStatus('已从网页选区载入')
      }
    })
  }, [])

  useEffect(() => {
    setDark(themeIsDark(settings.theme))
    void saveSettings(settings)
  }, [settings])

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }, [dark])

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch })), [])
  const notify = useCallback((message: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 1800)
  }, [])

  const applyResult = useCallback((result: { valid: boolean; value?: unknown; error?: string; line?: number; column?: number }, nextMode: OutputMode = 'json') => {
    if (!result.valid) {
      setStatus(`无效 JSON：${result.error ?? '无法解析'}${result.line ? ` · 第 ${result.line} 行，第 ${result.column} 列` : ''}`)
      return false
    }
    setOutput(String(result.value ?? ''))
    setMode(nextMode)
    setStatus('处理完成')
    return true
  }, [])

  const handleFormat = () => {
    setActiveAction('format')
    applyResult(formatJson(input, settings.indent))
  }
  const handleMinify = () => {
    setActiveAction('minify')
    applyResult(minifyJson(input))
  }
  const handleValidate = () => {
    setActiveAction('validate')
    const result = validateJson(input)
    setStatus(result.valid ? 'JSON 有效' : `无效 JSON：${result.error ?? '无法解析'}${result.line ? ` · 第 ${result.line} 行，第 ${result.column} 列` : ''}`)
  }
  const handleSort = (direction: SortDirection, recursive: boolean) => {
    setActiveAction('sort')
    const result = sortJson(input, settings.indent, direction, recursive)
    if (result.valid) {
      setOutput(String(result.value ?? ''))
      setMode('json')
      setStatus(`已按键名${direction === 'asc' ? '升序' : '降序'}排序${recursive ? '（递归）' : ''}`)
    } else {
      setStatus(`无效 JSON：${result.error ?? '无法解析'}${result.line ? ` · 第 ${result.line} 行，第 ${result.column} 列` : ''}`)
    }
  }
  const handleXml = () => {
    setActiveAction('xml')
    const result = validateJson(input)
    if (!result.valid) {
      handleValidate()
      return
    }
    setOutput(jsonToXml(result.value, settings.xmlRoot, settings.xmlItem))
    setMode('xml')
    setStatus('已转换为 XML')
  }
  const handleYaml = () => {
    setActiveAction('yaml')
    const result = validateJson(input)
    if (!result.valid) {
      handleValidate()
      return
    }
    setOutput(jsonToYaml(result.value, settings.indent))
    setMode('yaml')
    setStatus('已转换为 YAML')
  }
  const handleEscape = () => {
    setActiveAction('escape')
    setOutput(escapeJsonString(input))
    setMode('text')
    setStatus('已转义字符串')
  }
  const handleUnescape = () => {
    setActiveAction('unescape')
    const source = mode === 'text' ? output : input
    const result = unescapeJsonString(source)
    if (!result.valid) {
      setStatus(result.error ?? '反转义失败')
      return
    }
    setOutput(result.value ?? '')
    setMode('text')
    setStatus('已反转义字符串')
  }
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setStatus('已复制到剪贴板')
      notify('已复制到剪贴板')
    } catch {
      setStatus('复制失败')
      notify('复制失败，请检查浏览器权限')
    }
  }
  const handleSave = async () => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      name: `记录 ${history.length + 1}`,
      createdAt: Date.now(),
      operation: mode === 'xml' ? 'XML 转换' : mode === 'yaml' ? 'YAML 转换' : mode === 'text' ? '文本处理' : 'JSON 处理',
      valid: mode === 'json' ? validateJson(output).valid : true,
      size: output.length,
      content: output,
    }
    const next = [entry, ...history].slice(0, 20)
    setHistory(next)
    await saveHistory(next)
    setStatus('已保存到历史记录')
    notify('已保存到历史记录')
  }
  const handleDownload = () => {
    download(output, mode === 'xml' ? 'xml' : mode === 'yaml' ? 'yaml' : mode === 'text' ? 'txt' : 'json')
    setStatus('已开始下载')
  }

  const inputStats = useMemo(() => {
    const lines = input ? input.split('\n').length : 1
    return `${input.length.toLocaleString()} 字符 · ${lines} 行`
  }, [input])
  const outputStats = `${output.length.toLocaleString()} 字符 · ${output ? output.split('\n').length : 1} 行`

  return <main className="app-shell">
    <Toolbar
      dark={dark}
      activeAction={activeAction}
      mode={mode}
      onFormat={handleFormat}
      onMinify={handleMinify}
      onValidate={handleValidate}
      onSort={handleSort}
      onConvertXml={handleXml}
      onConvertYaml={handleYaml}
      onEscape={handleEscape}
      onUnescape={handleUnescape}
      onHistory={() => setShowHistory(true)}
      onTheme={() => updateSettings({ theme: dark ? 'light' : 'dark' })}
    />

    <section className="workspace" aria-label="JSON 工作区">
      <div className="editor-pane">
        <div className="pane-heading"><span><i className="signal-dot" />输入数据</span><small>{inputStats}</small></div>
        <CodeEditor ref={inputEditorRef} value={input} language="json" onChange={setInput} dark={dark} ariaLabel="JSON 输入编辑器" placeholder="粘贴 JSON 数据..." />
        <div className="fold-actions">
          <button onClick={() => inputEditorRef.current?.foldAll()}>全部折叠</button>
          <button onClick={() => inputEditorRef.current?.unfoldAll()}>全部展开</button>
        </div>
      </div>
      <div className="splitter" aria-hidden="true"><span>→</span></div>
      <div className="editor-pane output-pane">
        <div className="pane-heading"><span><i className="signal-dot output" />输出结果 <em>{mode.toUpperCase()}</em></span><div className="pane-heading-tools">{mode === 'xml' && <XmlControls root={settings.xmlRoot} item={settings.xmlItem} onRootChange={(xmlRoot) => updateSettings({ xmlRoot })} onItemChange={(xmlItem) => updateSettings({ xmlItem })} />}<IndentControl value={settings.indent} onChange={(indent) => updateSettings({ indent })} /><OutputActions onCopy={() => void handleCopy()} onDownload={handleDownload} onSave={() => void handleSave()} /><small>{outputStats}</small></div></div>
        <CodeEditor ref={outputEditorRef} value={output} language={mode} readOnly dark={dark} ariaLabel="格式化输出编辑器" />
        <div className="fold-actions">
          <button onClick={() => outputEditorRef.current?.foldAll()}>全部折叠</button>
          <button onClick={() => outputEditorRef.current?.unfoldAll()}>全部展开</button>
        </div>
      </div>
    </section>

    <footer className={`statusbar ${status.includes('无效') || status.includes('失败') ? 'error' : ''}`}>
      <span>{status}</span>
      <span className="status-hint">本地处理 · 不上传数据 · Ctrl/Cmd + Shift + J 打开</span>
    </footer>
    {toast && <div className="toast" role="status" aria-live="polite"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg><span>{toast}</span></div>}
    {showHistory && <HistoryPanel entries={history} onClose={() => setShowHistory(false)} onDelete={async (id) => {
      const next = history.filter((entry) => entry.id !== id)
      setHistory(next)
      await saveHistory(next)
    }} onLoad={(entry) => {
      setOutput(entry.content ?? '')
      setInput(entry.content ?? '')
      setMode(entry.operation === 'XML 转换' ? 'xml' : entry.operation === 'YAML 转换' ? 'yaml' : entry.operation === '文本处理' ? 'text' : 'json')
      setStatus(`已载入 ${entry.name}`)
      setShowHistory(false)
    }} />}
  </main>
}
