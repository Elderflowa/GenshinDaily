import { useState } from 'react'
import { timeLeft } from '../lib.js'
import { useStored } from '../hooks.js'

const PAIMON_EVENTS = 'https://paimon.moe/images/events'
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// Events whose API image is missing or wrong get a hand-picked one (and optionally a nicer name).
const OVERRIDES = [
  {
    test: /abyss/i,
    name: 'Spiral Abyss',
    img: 'https://static.wikia.nocookie.net/gensin-impact/images/c/ca/Domain_Spiral_Abyss_Abyssal_Moon_Spire.png',
  },
  {
    test: /imaginarium\s*the?a?t[eo]r/i,
    img: 'https://img.game8.co/3921410/51f18f583735fcc5141e83d3f59b9ce1.png/show',
  },
]

function prepareEvents(data) {
  const events = (data.events || []).filter(e => e.name && e.start_time > 0)
  const seen = new Set()
  return [...events, ...(data.challenges || [])]
    .map(ev => {
      const rule = OVERRIDES.find(r => r.test.test(ev.name))
      return { ...ev, key: ev.name, name: rule?.name || ev.name, image: rule?.img || ev.image_url }
    })
    .filter(ev => ev.image && !seen.has(ev.name) && seen.add(ev.name))
}

// Image fallback chain: API image → paimon.moe → plain text tile
function EventImage({ event }) {
  const [stage, setStage] = useState(0)
  const src = [event.image, `${PAIMON_EVENTS}/${slug(event.name)}.png`][stage]
  if (!src) return <div className="ev-img ev-img-text">{event.name}</div>
  return <img className="ev-img" src={src} alt="" onError={() => setStage(s => s + 1)} />
}

export default function Events({ data }) {
  const [dismissed, update] = useStored('gd_ev_dismissed', [])
  if (!data) return null

  const all = prepareEvents(data)
  if (!all.length) return null

  const visible = all.filter(ev => !dismissed.includes(ev.key))
  const hidden = all.length - visible.length

  return (
    <section className="events">
      <h2 className="stitle">
        <span>Active Events &amp; Challenges</span>
        {hidden > 0 && <button className="link-btn" onClick={() => update([])}>Restore {hidden} hidden</button>}
      </h2>
      <div className="events-list">
        {visible.map(ev => (
          <div className="ev-card" key={ev.key}>
            <button className="ev-hide" title="Mark as done / hide" onClick={() => update([...dismissed, ev.key])}>✕</button>
            <EventImage event={ev} />
            <div className="ev-body">
              <div className="ev-name">{ev.name}</div>
              {ev.end_time > 0 && <div className="ev-sub">{timeLeft(ev.end_time)}</div>}
              {ev.special_reward?.name === 'Primogem' && ev.special_reward.amount > 0 && (
                <div className="ev-sub primo">✦ {ev.special_reward.amount} Primogems</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
