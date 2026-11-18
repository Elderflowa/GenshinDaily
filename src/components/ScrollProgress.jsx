import { useEffect, useState, useMemo } from 'react'
import { progress } from '../lib.js'
import { DAILY, DAILY_BOSS_GROUPS, WEEKLY_GROUPS, MONTHLY } from '../tasks.jsx'
import { dayKey, weekKey, monthKey } from '../lib.js'

const DAILY_GROUPS = [{ tasks: DAILY }]
const MONTHLY_GROUPS = [{ tasks: MONTHLY }]

export default function ScrollProgress({
  daily,
  dailyBosses,
  weekly,
  monthly
}) {
  const [visible, setVisible] = useState(false)

  // Calculate overall progress
  const pct = useMemo(() => {
    const [d1, t1] = progress(DAILY_GROUPS, daily)
    const [d2, t2] = progress(DAILY_BOSS_GROUPS, dailyBosses)
    const [d3, t3] = progress(WEEKLY_GROUPS, weekly)
    const [d4, t4] = progress(MONTHLY_GROUPS, monthly)
    const done = d1 + d2 + d3 + d4
    const total = t1 + t2 + t3 + t4
    return total ? (done / total) * 100 : 0
  }, [daily, dailyBosses, weekly, monthly])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop
      setVisible(y > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="scroll-progress visible" style={{ '--pct': `${pct}%` }}>
      <div className="scroll-progress-bar">
        <i style={{ width: `var(--pct)` }} />
      </div>
    </div>
  )
}