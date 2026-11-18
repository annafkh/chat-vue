const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function nameFromEmail(email: string) {
  return email.trim().split('@')[0].split(/[._\-\s]+/).filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

export function sameDay(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() && first.getDate() === second.getDate()
}

export function clockTime(timestamp: number) {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function chatTime(timestamp: number, now = Date.now()) {
  if (now >= timestamp && now - timestamp < 60_000) return 'baru saja'
  const date = new Date(timestamp)
  if (sameDay(date, new Date(now))) return clockTime(timestamp)
  return `${date.getDate()} ${months[date.getMonth()]}`
}

export function dayLabel(timestamp: number, now = Date.now()) {
  const date = new Date(timestamp)
  const today = new Date(now)
  if (sameDay(date, today)) return 'Hari ini'
  today.setDate(today.getDate() - 1)
  if (sameDay(date, today)) return 'Kemarin'
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}
