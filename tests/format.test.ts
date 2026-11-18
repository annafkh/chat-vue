import { describe, expect, it } from 'vitest'
import { chatTime, dayLabel, nameFromEmail } from '../src/format'

describe('message and profile formatting', () => {
  it('formats the email local part in title case', () => {
    expect(nameFromEmail(' CHRIS_evans@example.com ')).toBe('Chris Evans')
    expect(nameFromEmail('mia.lee-parker@example.com')).toBe('Mia Lee Parker')
  })

  it('formats messages under one minute as just now, including across midnight', () => {
    const now = new Date(2026, 9, 11, 0, 0, 15).getTime()
    expect(chatTime(now - 59_999, now)).toBe('baru saja')
    expect(chatTime(now - 60_000, now)).toBe('10 Okt')
  })

  it('uses a padded 24-hour clock on the same calendar day', () => {
    const now = new Date(2026, 9, 11, 20).getTime()
    expect(chatTime(new Date(2026, 9, 11, 13, 5).getTime(), now)).toBe('13:05')
    expect(chatTime(new Date(2026, 9, 11, 8, 5).getTime(), now)).toBe('08:05')
  })

  it('labels the day at month and year boundaries', () => {
    const now = new Date(2026, 0, 1, 12).getTime()
    expect(dayLabel(now, now)).toBe('Hari ini')
    expect(dayLabel(new Date(2025, 11, 31).getTime(), now)).toBe('Kemarin')
    expect(dayLabel(new Date(2025, 11, 9).getTime(), now)).toBe('9 Des 2025')
  })
})
