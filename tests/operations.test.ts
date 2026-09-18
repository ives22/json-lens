import { describe, expect, it } from 'vitest'
import { countFoldItems } from '../src/editor/foldSummary'
import { escapeJsonString, formatJson, jsonToYaml, jsonToXml, minifyJson, sortJson, unescapeJsonString, validateJson } from '../src/operations'

describe('JSON operations', () => {
  it('formats and minifies JSON', () => {
    expect(formatJson('{"a":1,"b":[true]}', '2').value).toContain('\n  "a"')
    expect(minifyJson('{ "a": 1 }').value).toBe('{"a":1}')
  })

  it('reports invalid JSON location', () => {
    const result = validateJson('{\n  "a": }')
    expect(result.valid).toBe(false)
    expect(result.line).toBeGreaterThan(1)
  })

  it('converts nested values to XML', () => {
    expect(jsonToXml({ user: { name: 'A&B' }, roles: ['admin'] })).toContain('<item>admin</item>')
    expect(jsonToXml({ user: { name: 'A&B' } })).toContain('A&amp;B')
  })

  it('converts nested values to YAML', () => {
    const yaml = jsonToYaml({ user: { name: 'Alice', active: true }, roles: ['admin', 'viewer'], empty: [] })
    expect(yaml).toContain('user:\n  name: Alice\n  active: true')
    expect(yaml).toContain('roles:\n  - admin\n  - viewer')
    expect(yaml).toContain('empty: []')
    expect(jsonToYaml({ value: 'true' })).toContain('value: "true"')
  })

  it('sorts object keys recursively without reordering arrays', () => {
    const result = sortJson('{"z":1,"a":{"d":4,"c":3},"items":[{"z":2,"a":1}]}', '2')
    expect(result.value).toContain('"a": {\n    "c": 3,\n    "d": 4')
    expect(result.value).toContain('"items": [\n    {\n      "a": 1,\n      "z": 2')
    expect(result.value).toMatch(/"items": \[\n\s+\{\n\s+"a": 1/)
  })

  it('supports descending and shallow sorting', () => {
    const result = sortJson('{"a":{"z":1,"b":2},"c":3}', '2', 'desc', false)
    expect(result.value).toContain('"c": 3')
    expect(result.value).toContain('"a": {\n    "z": 1,\n    "b": 2')
  })

  it('escapes and unescapes JSON string content', () => {
    const escaped = escapeJsonString('hello\n"world"')
    expect(escaped).toBe('hello\\n\\"world\\"')
    expect(unescapeJsonString(escaped).value).toBe('hello\n"world"')
  })

  it('counts direct items for fold summaries', () => {
    expect(countFoldItems('json', '\n  "a": 1,\n  "b": [1, 2]\n')).toBe(2)
    expect(countFoldItems('xml', '\n  <item>x</item>\n  <item>y</item>\n')).toBe(2)
    expect(countFoldItems('yaml', '\n    - x\n    - y\n')).toBe(2)
  })
})
