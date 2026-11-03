import { describe, it, expect } from 'vitest'
import { parseInline, currentWeek, pct, taskIds, searchPlan, daysUntil } from './lib.js'
import plan from './data/plan.json'

describe('parseInline', () => {
  it('splits bold, code and links', () => {
    const p = parseInline('**Mon:** run `pytest` see [[LINK https://x.dev|docs]].')
    expect(p.map((x) => x.t)).toEqual(['b', 's', 'c', 's', 'a', 's'])
    expect(p[4]).toMatchObject({ v: 'docs', url: 'https://x.dev' })
  })
})

describe('currentWeek', () => {
  it('maps dates to weeks', () => {
    expect(currentWeek(new Date('2026-11-03T12:00:00Z'))).toBe(1)
    expect(currentWeek(new Date('2026-11-12T12:00:00Z'))).toBe(2)
    expect(currentWeek(new Date('2026-12-25T12:00:00Z'))).toBe(8) // holiday break -> next week
    expect(currentWeek(new Date('2026-10-01T12:00:00Z'))).toBe(1)
    expect(currentWeek(new Date('2027-06-01T12:00:00Z'))).toBe(12)
  })
})

describe('plan data', () => {
  it('has 12 weeks, 4 gates, 25 links, unique task ids', () => {
    expect(plan.weeks).toHaveLength(12)
    expect(plan.weeks.filter((w) => w.gate).map((w) => w.gate)).toEqual([1, 2, 3, 4])
    expect(plan.links.length).toBe(25)
    const ids = taskIds()
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('every week has steps and a done-when', () => {
    plan.weeks.forEach((w) => { expect(w.steps.length).toBeGreaterThan(0); expect(w.done).toBeTruthy() })
  })
})

describe('helpers', () => {
  it('pct', () => {
    expect(pct(['a', 'b', 'c', 'd'], { a: true })).toBe(25)
    expect(pct([], {})).toBe(0)
  })
  it('search finds terraform', () => {
    expect(searchPlan('terraform').length).toBeGreaterThan(3)
    expect(searchPlan('x')).toEqual([])
  })
  it('daysUntil', () => {
    expect(daysUntil('2026-11-10', new Date('2026-11-03T12:00:00'))).toBe(7)
  })
})
