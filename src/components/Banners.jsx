import { useState } from 'react'
import { timeLeft } from '../lib.js'

const FULL_ART = 'https://cdn.jsdelivr.net/gh/MadeBaruna/paimon-moe@main/static/images/characters/full'
// Characters whose full-art file name differs from the short id the API uses.
const FULL_ART_NAMES = {
  kazuha: 'kaedehara_kazuha', ayaka: 'kamisato_ayaka', ayato: 'kamisato_ayato',
  kokomi: 'sangonomiya_kokomi', heizou: 'shikanoin_heizou', mizuki: 'yumemizuki_mizuki',
}

const artUrl = char => {
  const raw = typeof char.id === 'string' && char.id ? char.id : (char.name || '')
  const id = raw.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  return `${FULL_ART}/${FULL_ART_NAMES[id] || id}.png`
}

function Banner({ banner }) {
  const [expanded, setExpanded] = useState(false)
  const chars = banner.characters || []
  const items = [
    ...chars.map(c => ({ ...c, kind: 'char' })),
    ...(banner.weapons || []).filter(w => w.rarity === 5).map(w => ({ ...w, kind: 'weapon' })),
  ]
  const shown = expanded ? items : items.slice(0, 4)
  const hiddenCount = items.length - 4
  const artChar = chars.find(c => c.rarity === 5) || chars[0]

  return (
    <div className="banner">
      {artChar && <div className="banner-art" style={{ backgroundImage: `url(${artUrl(artChar)})` }} />}
      <div className="banner-content">
        <div className="banner-name">{banner.name}</div>
        <div className="banner-items">
          {shown.map((item, i) => (
            <div className={`banner-item r${item.rarity === 5 ? 5 : 4}`} key={`${item.kind}-${item.id ?? i}`}>
              <img src={item.icon} alt="" onError={e => { e.target.style.display = 'none' }} />
              <div>
                <div className="banner-item-name">{item.name}</div>
                <div className="banner-item-sub">{item.kind === 'weapon' ? '★★★★★ Weapon' : item.element}</div>
              </div>
            </div>
          ))}
        </div>
        {hiddenCount > 0 && (
          <button className="link-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? '▲ collapse' : `+ ${hiddenCount} more`}
          </button>
        )}
        {banner.end_time > 0 && <div className="banner-timer">{timeLeft(banner.end_time)}</div>}
      </div>
    </div>
  )
}

export default function Banners({ data, error }) {
  const banners = (data?.banners || []).filter(b => b.characters?.length || b.weapons?.length)
  return (
    <section>
      <h2 className="stitle">Current Banners</h2>
      {error && <p className="note">Couldn't reach the banner API. Reload to try again.</p>}
      {!data && !error && <p className="note">Loading…</p>}
      <div className="banners">
        {banners.map(b => <Banner key={b.id ?? b.name} banner={b} />)}
      </div>
    </section>
  )
}
