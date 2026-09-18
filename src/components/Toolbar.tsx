import { useState } from 'react'
import type { ReactNode } from 'react'
import type { ActionId, OutputMode, Settings, SortDirection } from '../types'

type IconName = 'braces' | 'spark' | 'check' | 'sort' | 'xml' | 'yaml' | 'escape' | 'copy' | 'download' | 'save' | 'history' | 'sun' | 'moon' | 'lock' | 'chevron'

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  const paths: Record<IconName, ReactNode> = {
    braces: <><path d="M8 3H6.8A1.8 1.8 0 0 0 5 4.8v4A2.2 2.2 0 0 1 2.8 11 2.2 2.2 0 0 1 5 13.2v4A1.8 1.8 0 0 0 6.8 19H8" /><path d="M16 3h1.2A1.8 1.8 0 0 1 19 4.8v4a2.2 2.2 0 0 0 2.2 2.2A2.2 2.2 0 0 0 19 13.2v4a1.8 1.8 0 0 1-1.8 1.8H16" /><path d="M9.5 8.5h5M9.5 12h5M9.5 15.5h5" /></>,
    spark: <><path d="m12 3 1.2 5.8L19 10l-5.8 1.2L12 17l-1.2-5.8L5 10l5.8-1.2L12 3Z" /><path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z" /></>,
    check: <><path d="m5 12 4.2 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    sort: <><path d="M8 5v14M5 8l3-3 3 3M16 19V5M13 16l3 3 3-3" /></>,
    xml: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" /></>,
    yaml: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h5M8 16h8" /></>,
    escape: <><path d="M8 7H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3M16 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3" /><path d="m10 9 4 6M14 9l-4 6" /></>,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
    save: <><path d="M5 4h12l2 2v14H5z" /><path d="M8 4v6h8V4M9 20v-6h6v6" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5M12 7v5l3 2" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></>,
    chevron: <path d="m9 6 6 6-6 6" />,
  }
  return <svg {...common}>{paths[name]}</svg>
}

interface ToolbarProps {
  dark: boolean
  activeAction: ActionId
  mode: OutputMode
  onFormat: () => void
  onMinify: () => void
  onValidate: () => void
  onSort: (direction: SortDirection, recursive: boolean) => void
  onConvertXml: () => void
  onConvertYaml: () => void
  onEscape: () => void
  onUnescape: () => void
  onHistory: () => void
  onTheme: () => void
}

interface OutputActionsProps {
  onCopy: () => void
  onDownload: () => void
  onSave: () => void
}

interface IndentControlProps {
  value: Settings['indent']
  onChange: (value: Settings['indent']) => void
}

interface XmlControlsProps {
  root: string
  item: string
  onRootChange: (value: string) => void
  onItemChange: (value: string) => void
}

export function IndentControl({ value, onChange }: IndentControlProps) {
  return <label className="pane-indent-control">缩进<select value={value} onChange={(event) => onChange(event.target.value as Settings['indent'])}><option value="2">2 空格</option><option value="4">4 空格</option><option value="tab">Tab</option></select></label>
}

export function XmlControls({ root, item, onRootChange, onItemChange }: XmlControlsProps) {
  return <div className="xml-controls" aria-label="XML 输出配置">
    <label>根节点<input value={root} onChange={(event) => onRootChange(event.target.value)} /></label>
    <label>数组项<input value={item} onChange={(event) => onItemChange(event.target.value)} /></label>
  </div>
}

export function OutputActions({ onCopy, onDownload, onSave }: OutputActionsProps) {
  return <div className="output-actions pane-output-actions" aria-label="输出操作">
    <span className="footer-label">OUTPUT</span>
    <button className="footer-button" onClick={onCopy} title="复制输出"><Icon name="copy" size={14} />复制</button>
    <button className="footer-button" onClick={onDownload} title="下载输出"><Icon name="download" size={14} />下载</button>
    <button className="footer-button" onClick={onSave} title="保存到历史记录"><Icon name="save" size={14} />保存</button>
  </div>
}

export function Toolbar({ dark, activeAction, mode, onFormat, onMinify, onValidate, onSort, onConvertXml, onConvertYaml, onEscape, onUnescape, onHistory, onTheme }: ToolbarProps) {
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  return <>
    <header className="app-header">
      <div className="brand-block">
        <div className="brand-mark"><Icon name="braces" size={19} /></div>
        <div className="brand-copy"><span className="brand-overline">LOCAL JSON WORKBENCH</span><strong>JSON Lens</strong></div>
        <span className="privacy-badge"><Icon name="lock" size={12} /> 本地处理</span>
      </div>
      <div className="header-tools" aria-label="应用设置">
        <button className="utility-button" onClick={onHistory} title="查看历史记录"><Icon name="history" size={15} /><span>历史</span></button>
        <button className="utility-button" onClick={onTheme} title="切换浅色/深色主题"><Icon name={dark ? 'moon' : 'sun'} size={15} /><span>{dark ? '深色' : '浅色'}</span></button>
      </div>
    </header>

    <section className="command-bar" aria-label="JSON 操作工具栏">
      <div className="command-heading">
        <div><span className="section-eyebrow">TRANSFORM / INSPECT</span></div>
        <span className="command-note">离线运行 · 无上传 · 适合高频处理</span>
      </div>
      <div className="command-row">
        <button className={`action-button ${activeAction === 'format' ? 'selected' : ''}`} onClick={onFormat} title="格式化 JSON"><span className="action-icon"><Icon name="spark" /></span><span className="action-copy"><strong>格式化</strong><small>美化结构</small></span><Icon name="chevron" size={14} /></button>
        <button className={`action-button ${activeAction === 'minify' ? 'selected' : ''}`} onClick={onMinify} title="压缩 JSON"><span className="action-icon"><Icon name="braces" /></span><span className="action-copy"><strong>压缩</strong><small>移除空白</small></span><Icon name="chevron" size={14} /></button>
        <button className={`action-button ${activeAction === 'validate' ? 'selected' : ''}`} onClick={onValidate} title="校验 JSON"><span className="action-icon"><Icon name="check" /></span><span className="action-copy"><strong>校验</strong><small>检查语法</small></span><Icon name="chevron" size={14} /></button>
        <div className="sort-action">
          <button className={`action-button ${activeAction === 'sort' ? 'selected' : ''}`} onClick={() => onSort(sortDirection, true)} title="按键名排序 JSON"><span className="action-icon"><Icon name="sort" /></span><span className="action-copy"><strong>排序</strong><small>递归键名</small></span><Icon name="chevron" size={14} /></button>
          <div className="sort-direction-group" role="group" aria-label="排序方向">
            <button className={`sort-direction-option ${sortDirection === 'asc' ? 'selected' : ''}`} onClick={() => setSortDirection('asc')} aria-pressed={sortDirection === 'asc'} title="升序 A 到 Z"><span>升序</span><small>A→Z</small></button>
            <button className={`sort-direction-option ${sortDirection === 'desc' ? 'selected' : ''}`} onClick={() => setSortDirection('desc')} aria-pressed={sortDirection === 'desc'} title="降序 Z 到 A"><span>降序</span><small>Z→A</small></button>
          </div>
        </div>
        <span className="command-divider" aria-hidden="true" />
        <button className={`action-button compact ${activeAction === 'xml' ? 'selected' : ''}`} onClick={onConvertXml} title="转换为 XML"><span className="action-icon"><Icon name="xml" /></span><span className="action-copy"><strong>XML</strong><small>转换输出</small></span></button>
        <button className={`action-button compact ${activeAction === 'yaml' ? 'selected' : ''}`} onClick={onConvertYaml} title="转换为 YAML"><span className="action-icon"><Icon name="yaml" /></span><span className="action-copy"><strong>YAML</strong><small>转换输出</small></span></button>
        <button className={`action-button compact ${activeAction === 'escape' ? 'selected' : ''}`} onClick={onEscape} title="转义 JSON 字符串"><span className="action-icon"><Icon name="escape" /></span><span className="action-copy"><strong>转义</strong><small>字符串</small></span></button>
        <button className={`action-button compact ${activeAction === 'unescape' ? 'selected' : ''}`} onClick={onUnescape} title="反转义 JSON 字符串"><span className="action-icon"><Icon name="escape" /></span><span className="action-copy"><strong>反转义</strong><small>还原内容</small></span></button>
      </div>
    </section>
  </>
}
