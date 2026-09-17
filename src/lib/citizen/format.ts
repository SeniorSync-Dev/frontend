const LOCALE = 'da-DK'
const MS_PER_DAY = 86_400_000

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function firstName(name?: string | null) {
  return name?.trim().split(/\s+/)[0] ?? ''
}

export function formatLongDate(date: Date) {
  const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(date)
  const dayAndMonth = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long' }).format(date)
  return `${capitalize(weekday)} den ${dayAndMonth}`
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })
    .format(date)
    .replace(':', '.')
}

export function formatTimeRange(start: Date, end?: Date) {
  return end ? `${formatTime(start)}-${formatTime(end)}` : formatTime(start)
}

export function formatShortWeekday(date: Date) {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'short' })
    .format(date)
    .replace('.', '')
    .toUpperCase()
}

export function formatDayNumber(date: Date) {
  return `${date.getDate()}.`
}

function daysFromToday(date: Date, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY)
}

export function formatRelativeDay(date: Date, now = new Date()) {
  const diff = daysFromToday(date, now)
  if (diff === 0) return 'i dag'
  if (diff === 1) return 'i morgen'
  if (diff === -1) return 'i går'
  return formatLongDate(date).toLowerCase()
}

export function formatRelativeDateTime(date: Date, now = new Date()) {
  return `${capitalize(formatRelativeDay(date, now))} kl. ${formatTime(date)}`
}

export function formatDateLabel(date: Date, now = new Date()) {
  const diff = daysFromToday(date, now)
  if (diff === 0) return 'I DAG'
  if (diff === 1) return 'I MORGEN'
  return `${formatShortWeekday(date)} ${formatDayNumber(date)}`
}

export function greeting(now = new Date()) {
  const hour = now.getHours()
  if (hour >= 5 && hour < 10) return 'Godmorgen'
  if (hour >= 10 && hour < 18) return 'Goddag'
  return 'Godaften'
}
