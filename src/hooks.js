import { useEffect, useState } from 'react'
import { load, save } from './lib.js'

// Re-render once a minute so countdowns and period rollovers show up on their own.
export function useMinuteTick() {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), 60000)
    return () => clearInterval(id)
  }, [])
}

// localStorage-backed state that also updates when another device syncs a new value.
export function useStored(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback))
  useEffect(() => {
    const onSync = e => { if (e.detail.includes(key)) setValue(load(key, fallback)) }
    window.addEventListener('gd-sync', onSync)
    return () => window.removeEventListener('gd-sync', onSync)
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const set = next => { setValue(next); save(key, next) }
  return [value, set]
}

// Checkbox state that is cleared automatically when the period (day/week/month) changes.
export function usePeriodChecks(storeKey, getKey) {
  const [stored, setStored] = useStored(storeKey, { key: '', checks: {} })
  useMinuteTick()
  const key = getKey()
  const checks = stored.key === key ? stored.checks : {}

  const toggle = id => {
    setStored({ key, checks: { ...checks, [id]: !checks[id] } })
  }
  return [checks, toggle]
}

// A cooldown that starts when you click it (plants, crystal flies).
export function useTimer(storeKey, duration) {
  const [startedAt, set] = useStored(storeKey, null)
  useMinuteTick()
  const remaining = startedAt ? Math.max(0, startedAt + duration - Date.now()) : 0

  return { remaining, start: () => set(Date.now()), reset: () => set(null) }
}

// Banner / event data, cached for 15 minutes.
const CALENDAR_URL = 'https://api.ennead.cc/mihoyo/genshin/calendar'
const CALENDAR_TTL = 15 * 60 * 1000

export function useCalendar() {
  const [state, setState] = useState(() => {
    const cached = load('gd_calendar')
    return cached && Date.now() - cached.ts < CALENDAR_TTL ? { data: cached.data } : {}
  })

  useEffect(() => {
    if (state.data) return
    fetch(CALENDAR_URL)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status))))
      .then(data => {
        save('gd_calendar', { ts: Date.now(), data })
        setState({ data })
      })
      .catch(() => {
        const stale = load('gd_calendar') // better an old banner than none
        setState(stale ? { data: stale.data } : { error: true })
      })
  }, [])

  return state
}

// Material icons are looked up by item name (genshin-db-api) and remembered.
// `names` are tried in order; an entry starting with "http" is used as the image itself.
const ICON_API = 'https://genshin-db-api.vercel.app/api/v5/materials'
const lookups = {}

async function fetchIcon(name) {
  if (name.startsWith('http')) return name
  const r = await fetch(`${ICON_API}?query=${encodeURIComponent(name)}&resultLanguage=English`)
  if (!r.ok) throw new Error(r.status)
  const res = await r.json()
  const images = (Array.isArray(res) ? res[0] : res)?.images
  const url = images?.mihoyo_icon || (images?.filename_icon && `https://enka.network/ui/${images.filename_icon}.png`)
  if (!url) throw new Error('no icon')
  return url
}

function lookupIcon(key, names) {
  lookups[key] ??= names
    .reduce((attempt, name) => attempt.catch(() => fetchIcon(name)), Promise.reject())
    .then(url => {
      save('gd_icons', { ...load('gd_icons', {}), [key]: url })
      return url
    })
  return lookups[key]
}

export function useMaterialIcon(names) {
  const key = names.join('|')
  const [url, setUrl] = useState(() => (key && load('gd_icons', {})[key]) || null)
  useEffect(() => {
    if (key && !url) lookupIcon(key, names).then(setUrl, () => {})
  }, [key])
  return url
}
