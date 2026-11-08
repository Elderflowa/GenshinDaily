import { markChanged } from './sync.js'
// ── Server clock ─────────────────────────────────────────────────────────────
// Change this to the server your account is on: 'Europe', 'America' or 'Asia'.
// (Asia also covers TW/HK/MO.) Daily reset is 04:00 on that server's clock.
export const SERVER = 'Europe'

const UTC_OFFSET = { Europe: 1, America: -5, Asia: 8 }[SERVER]
const RESET_HOUR = 4
const HOUR = 3600000

// Shifted so the UTC getters of the result read as "server time minus the reset hour":
// the date only rolls over at 04:00 server time.
const gameNow = () => new Date(Date.now() + (UTC_OFFSET - RESET_HOUR) * HOUR)

export const dayKey = () => gameNow().toISOString().slice(0, 10)
export const monthKey = () => gameNow().toISOString().slice(0, 7)
export const weekKey = () => {
  const d = gameNow()
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)) // back to Monday
  return d.toISOString().slice(0, 10)
}
export const RESET_TIME = `04:00 ${SERVER} server time`
export const msUntilReset = () => 86400000 - ((Date.now() + (UTC_OFFSET - RESET_HOUR) * HOUR) % 86400000)

// ── Formatting ───────────────────────────────────────────────────────────────
export const fmtDuration = ms => {
  const days = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / HOUR)
  const m = Math.floor((ms % HOUR) / 60000)
  return days > 0 ? `${days}d ${h}h` : `${h}h ${m}m`
}

// Time remaining until a unix timestamp (seconds), as shown on banners and events.
export const timeLeft = ts => {
  const ms = ts * 1000 - Date.now()
  if (ms <= 0) return 'Ended'
  const days = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / HOUR)
  return days > 0 ? `${days}d ${h}h` : `${h}h left`
}

// [done, total] for a list of task groups. Timer tasks are not counted.
export const progress = (groups, checks) => {
  const tasks = groups.flatMap(g => g.tasks).filter(t => !t.timer)
  return [tasks.filter(t => checks[t.id]).length, tasks.length]
}

// ── localStorage (never throws) ──────────────────────────────────────────────
export const load = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}
export const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage full or blocked */ }
  markChanged(key)
}
