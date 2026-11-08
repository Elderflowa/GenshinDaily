import { useState } from 'react'
import { useTimer, useMaterialIcon } from '../hooks.js'
import { fmtDuration, progress } from '../lib.js'
import { REGION_COLORS } from '../tasks.jsx'

function Row({ task, icon = task.icon, done, onClick, sub, right, inert }) {
  return (
    <div className={`task${done ? ' done' : ''}${inert ? ' inert' : ''}`} onClick={onClick}>
      <div className="task-icon">
        {typeof icon === 'string'
          ? <img src={icon} alt="" onError={e => { e.target.style.display = 'none' }} />
          : icon}
      </div>
      <div className="task-text">
        <div className="task-label">{task.label}</div>
        {sub && <div className="task-sub">{sub}</div>}
      </div>
      {right}
      <span className="task-check">✓</span>
    </div>
  )
}

function TimerRow({ task }) {
  const { remaining, start, reset } = useTimer(`gd_timer_${task.id}`, task.timer.ms)
  const running = remaining > 0
  return (
    <Row
      task={task}
      done={running}
      inert={running}
      onClick={running ? undefined : start}
      sub={running ? <span className="timer">⏱ {fmtDuration(remaining)}</span> : task.timer.ready}
      right={running && <button className="timer-reset" title="Reset timer" onClick={reset}>✕</button>}
    />
  )
}

// Material icon with a lettered tile when the icon can't be found.
function MaterialIcon({ names, label }) {
  const url = useMaterialIcon(names)
  const [broken, setBroken] = useState(false)
  if (!url || broken) return <span className="icon-letter">{label[0]}</span>
  return <img src={url} alt="" onError={() => setBroken(true)} />
}

function TaskRow({ task, checked, onToggle }) {
  return (
    <Row
      task={task}
      icon={'material' in task ? <MaterialIcon names={task.material} label={task.label} /> : task.icon}
      done={checked}
      onClick={onToggle}
      sub={task.sub}
      right={task.badge && <span className="badge">{task.badge}</span>}
    />
  )
}

// groups: [{ title?, tasks }]. Timer tasks are shown but not counted in x/y.
export default function Checklist({ title, groups, checks, onToggle, note }) {
  const [done, total] = progress(groups, checks)
  return (
    <section className="card">
      <h2 className="stitle">
        <span>{title}</span>
        <span className={done === total ? 'ok' : ''}>{done}/{total}</span>
      </h2>
      <div className={`groups${groups.length === 1 ? ' flat' : ''}`}>
        {groups.map((g, i) => (
          <div className="group" key={g.title ?? i}>
            {g.title && (
              <h3 className="group-title" style={{ '--c': REGION_COLORS[g.title] }}>
                {g.title}<span>{progress([g], checks).join('/')}</span>
              </h3>
            )}
            <div className="tasks">
              {g.tasks.map(t => t.timer
                ? <TimerRow key={t.id} task={t} />
                : <TaskRow key={t.id} task={t} checked={checks[t.id]} onToggle={() => onToggle(t.id)} />)}
            </div>
          </div>
        ))}
      </div>
      {note && <p className="reset-note">{note}</p>}
    </section>
  )
}
