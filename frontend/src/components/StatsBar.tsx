import type { Stats } from '../types'

interface Props {
  stats: Stats | null
}

export default function StatsBar({ stats }: Props) {
  if (!stats) return null
  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-value">{stats.total_unique}</span>
        <span className="stat-label">Unique Pieces</span>
      </div>
      <div className="stat">
        <span className="stat-value">{stats.total_items}</span>
        <span className="stat-label">Total Items</span>
      </div>
      <div className="stat">
        <span className="stat-value">
          ${stats.total_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
        <span className="stat-label">Total Value</span>
      </div>
    </div>
  )
}
