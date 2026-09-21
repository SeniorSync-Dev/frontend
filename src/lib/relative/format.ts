const LOCALE = 'en-GB'
const MS_PER_DAY = 86_400_000

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date)
}

export function formatTimeRange(start: Date, end?: Date) {
  return end ? `${formatTime(start)}-${formatTime(end)}` : formatTime(start)
}

export function formatShortWeekday(date: Date) {
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'short' }).format(date).toUpperCase()
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
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  if (diff === -1) return 'yesterday'
  return formatLongDate(date)
}

export function formatRelativeDateTime(date: Date, now = new Date()) {
  return `${capitalize(formatRelativeDay(date, now))} at ${formatTime(date)}`
}

export function formatDateLabel(date: Date, now = new Date()) {
  const diff = daysFromToday(date, now)
  if (diff === 0) return 'TODAY'
  if (diff === 1) return 'TOMORROW'
  return `${formatShortWeekday(date)} ${formatDayNumber(date)}`
}
