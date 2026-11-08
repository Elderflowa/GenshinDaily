import { useMinuteTick } from '../hooks.js'
import { dayKey, fmtDuration, msUntilReset } from '../lib.js'

// "Today" in game time (the date only changes at the 04:00 reset).
export default function Hero({ done, total }) {
  useMinuteTick()
  const day = new Date(`${dayKey()}T12:00:00Z`)
  const weekday = day.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' })
  const date = day.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <section className="hero">
      <div className="hero-day">
        <h1 className="grad">{weekday}</h1>
        <span className="eyebrow">{date}</span>
      </div>
      <div className="hero-stat">
        <div className="hero-count"><b>{done}</b>/{total}<span className="long"> done today</span></div>
        <div className="bar"><i style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
        <div className="hero-reset">⏱ <span className="long">Resets in </span>{fmtDuration(msUntilReset())}</div>
      </div>
    </section>
  )
}
