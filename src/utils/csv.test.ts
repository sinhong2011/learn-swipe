import { describe, it, expect } from 'vitest'
import { parseCsv, rowsToCards } from './csv'

describe('parseCsv', () => {
  it('parses simple csv with headers', () => {
    const text = 'Front,Back\nHello,World\nA,B\n'
    const parsed = parseCsv(text)
    expect(parsed.headers).toEqual(['Front','Back'])
    expect(parsed.rows.length).toBe(2)
  })

  it('parses quoted values and escaped quotes', () => {
    const text = 'Question,Answer\n"He said ""Hi""",Yes\n'
    const parsed = parseCsv(text)
    const cards = rowsToCards(parsed.headers, parsed.rows)
    expect(cards[0].question).toBe('He said "Hi"')
  })

  it('falls back to first two columns when no headers', () => {
    const text = 'Q1,A1\nQ2,A2\n'
    const parsed = parseCsv(text)
    const cards = rowsToCards(parsed.headers, parsed.rows)
    expect(cards[0].question).toBe('Q1')
    expect(cards[0].answer).toBe('A1')
  })
})

