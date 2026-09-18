import type { HistoryEntry } from '../types'

interface HistoryPanelProps {
  entries: HistoryEntry[]
  onLoad: (entry: HistoryEntry) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function CloseIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
}

function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
}

export function HistoryPanel({ entries, onLoad, onDelete, onClose }: HistoryPanelProps) {
  return <div className="history-overlay" onClick={onClose}>
    <aside className="history-panel" aria-label="历史记录" onClick={(event) => event.stopPropagation()}>
      <div className="panel-heading"><div><span className="eyebrow">LOCAL ARCHIVE</span><h2>历史记录</h2><p>只保存你主动归档的内容</p></div><button className="close-button" onClick={onClose} title="关闭历史记录" aria-label="关闭历史记录"><CloseIcon /></button></div>
      {entries.length === 0 ? <div className="empty-state"><span className="empty-mark">+</span><strong>还没有保存的内容</strong><span>点击输出区的保存按钮，将当前结果放入本地历史。</span></div> : <div className="history-list">
        {entries.map((entry) => <article className="history-item" key={entry.id}>
          <button className="history-load" onClick={() => onLoad(entry)}><span className="history-item-top"><strong>{entry.name}</strong><em className={entry.valid ? 'valid' : 'invalid'}>{entry.valid ? 'VALID' : 'INVALID'}</em></span><span>{new Date(entry.createdAt).toLocaleString('zh-CN')} · {entry.size.toLocaleString()} 字符</span><small>{entry.operation}</small></button>
          <button className="delete-button" onClick={() => onDelete(entry.id)} title="删除记录" aria-label={`删除 ${entry.name}`}><TrashIcon /></button>
        </article>)}
      </div>}
    </aside>
  </div>
}
