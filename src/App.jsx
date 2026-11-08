import { useState } from 'react'
import Hero from './components/Hero.jsx'
import Checklist from './components/Checklist.jsx'
import Events from './components/Events.jsx'
import Banners from './components/Banners.jsx'
import SyncCard from './components/SyncCard.jsx'
import { useCalendar, usePeriodChecks } from './hooks.js'
import { DAILY, DAILY_BOSS_GROUPS, WEEKLY_GROUPS, MONTHLY } from './tasks.jsx'
import { dayKey, weekKey, monthKey, progress, RESET_TIME } from './lib.js'

const DAILY_GROUPS = [{ tasks: DAILY }]
const MONTHLY_GROUPS = [{ tasks: MONTHLY }]

export default function App() {
  const calendar = useCalendar()
  const [tab, setTab] = useState('today')

  const [daily, toggleDaily] = usePeriodChecks('gd_daily', dayKey)
  const [dailyBosses, toggleDailyBoss] = usePeriodChecks('gd_daily_bosses', dayKey)
  const [weekly, toggleWeekly] = usePeriodChecks('gd_weekly', weekKey)
  const [monthly, toggleMonthly] = usePeriodChecks('gd_monthly', monthKey)

  const [d1, t1] = progress(DAILY_GROUPS, daily)
  const [d2, t2] = progress(DAILY_BOSS_GROUPS, dailyBosses)
  const [d3, t3] = progress(WEEKLY_GROUPS, weekly)
  const [d4, t4] = progress(MONTHLY_GROUPS, monthly)

  // Narrow window (half screen): one tab at a time. Wide window: everything side by side.
  const tabs = [
    { id: 'today', label: 'Today', count: `${d1 + d2}/${t1 + t2}` },
    { id: 'weekly', label: 'Weekly & Monthly', count: `${d3 + d4}/${t3 + t4}` },
    { id: 'info', label: 'Events & Banners' },
  ]
  const pane = id => `pane${tab === id ? ' on' : ''}`

  return (
    <div className="app">
      <Hero done={d1 + d2} total={t1 + t2} />

      <nav className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}${t.id === 'info' ? ' info-tab' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}{t.count && <span>{t.count}</span>}
          </button>
        ))}
      </nav>

      <div className="layout">
        <main className={pane('today')}>
          <Checklist title="Daily" groups={DAILY_GROUPS} checks={daily} onToggle={toggleDaily} />
          <Checklist title="Daily Bosses" groups={DAILY_BOSS_GROUPS} checks={dailyBosses} onToggle={toggleDailyBoss} />
        </main>
        <main className={pane('weekly')}>
          <Checklist title="Weekly" groups={WEEKLY_GROUPS} checks={weekly} onToggle={toggleWeekly}
            note={`Resets Monday at ${RESET_TIME} · first 3 boss rewards cost half resin`} />
          <Checklist title="Monthly" groups={MONTHLY_GROUPS} checks={monthly} onToggle={toggleMonthly}
            note={`Resets on the 1st at ${RESET_TIME}`} />
        </main>
        <aside className={pane('info')}>
          <Events data={calendar.data} />
          <Banners data={calendar.data} error={calendar.error} />
          <SyncCard />
        </aside>
      </div>
    </div>
  )
}
