import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { codeFolding, foldAll, HighlightStyle, syntaxHighlighting, unfoldAll } from '@codemirror/language'
import { json } from '@codemirror/lang-json'
import { xml } from '@codemirror/lang-xml'
import { yaml } from '@codemirror/lang-yaml'
import { tags } from '@lezer/highlight'
import { basicSetup } from 'codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { countFoldItems, type FoldLanguage } from './foldSummary'

export interface CodeEditorHandle {
  foldAll: () => void
  unfoldAll: () => void
  focus: () => void
}

interface CodeEditorProps {
  value: string
  language: 'json' | 'xml' | 'yaml' | 'text'
  onChange?: (value: string) => void
  readOnly?: boolean
  dark?: boolean
  placeholder?: string
  ariaLabel: string
}

const lightTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: '#152327' },
  '.cm-content': { caretColor: '#0f9d86', fontFamily: 'var(--mono-font)' },
  '.cm-gutters': { backgroundColor: 'transparent', color: '#8b9da0', border: 'none' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#0f9d86' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'var(--editor-selection)' },
})

const selectionTheme = EditorView.theme({
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'var(--editor-selection)' },
})

const lightHighlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.propertyName, color: '#0879a8' },
  { tag: tags.string, color: '#9a4d15' },
  { tag: tags.number, color: '#8a5a00' },
  { tag: [tags.bool, tags.atom], color: '#b33939' },
  { tag: tags.comment, color: '#718487', fontStyle: 'italic' },
  { tag: tags.tagName, color: '#087866' },
  { tag: tags.attributeName, color: '#8e3d77' },
  { tag: [tags.operator, tags.punctuation], color: '#617477' },
]))

const darkHighlighting = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.propertyName, color: '#69b8ff' },
  { tag: tags.string, color: '#f0bd74' },
  { tag: tags.number, color: '#c3a6ff' },
  { tag: [tags.bool, tags.atom], color: '#ff8d9a' },
  { tag: tags.comment, color: '#78928e', fontStyle: 'italic' },
  { tag: tags.tagName, color: '#64dfc0' },
  { tag: tags.attributeName, color: '#f4a3dc' },
  { tag: [tags.operator, tags.punctuation], color: '#9ab0ad' },
]))

function languageSupport(language: CodeEditorProps['language']) {
  if (language === 'xml') return xml()
  if (language === 'yaml') return yaml()
  return language === 'json' ? json() : []
}

function foldSummary(language: FoldLanguage) {
  return codeFolding({
    preparePlaceholder: (state, range) => ({ count: countFoldItems(language, state.sliceDoc(range.from, range.to)) }),
    placeholderDOM: (_view, onclick, prepared) => {
      const element = document.createElement('span')
      const count = typeof prepared?.count === 'number' ? prepared.count : 0
      element.className = 'cm-foldPlaceholder cm-foldSummary'
      element.textContent = String(count)
      element.title = `展开，包含 ${count} 个元素`
      element.setAttribute('aria-label', `展开，包含 ${count} 个元素`)
      element.onclick = onclick
      return element
    },
  })
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(function CodeEditor({ value, language, onChange, readOnly = false, dark = false, placeholder, ariaLabel }, ref) {
  const hostRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!hostRef.current) return
    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        languageSupport(language),
        foldSummary(language),
        keymap.of([...defaultKeymap, indentWithTab]),
        ...(dark ? [oneDark, darkHighlighting] : [lightTheme, lightHighlighting]),
        selectionTheme,
        EditorView.editable.of(!readOnly),
        EditorState.readOnly.of(readOnly),
        EditorView.contentAttributes.of({ 'aria-label': ariaLabel, spellcheck: 'false' }),
        ...(placeholder ? [EditorView.contentAttributes.of({ 'data-placeholder': placeholder })] : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current?.(update.state.doc.toString())
        }),
      ],
    })
    const view = new EditorView({ state: startState, parent: hostRef.current })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [ariaLabel, dark, language, placeholder, readOnly])

  useEffect(() => {
    const view = viewRef.current
    if (!view || view.state.doc.toString() === value) return
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
  }, [value])

  useImperativeHandle(ref, () => ({
    foldAll: () => viewRef.current && foldAll(viewRef.current),
    unfoldAll: () => viewRef.current && unfoldAll(viewRef.current),
    focus: () => viewRef.current?.focus(),
  }))

  return <div className="editor-host" ref={hostRef} />
})
