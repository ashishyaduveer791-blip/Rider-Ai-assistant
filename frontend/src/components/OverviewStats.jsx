import { Package, CheckCircle2, Navigation, Sparkles } from 'lucide-react'

export default function OverviewStats({ aiInteractions = 27, activeDeliveries = 3 }) {
  const stats = [
    {
      id: 'deliveries',
      label: 'Deliveries',
      value: '12',
      badge: 'Today',
      badgeColor: 'neutral',
      icon: <Package size={18} />,
    },
    {
      id: 'completed',
      label: 'Completed',
      value: '8 / 12',
      badge: 'On Schedule',
      badgeColor: 'green',
      icon: <CheckCircle2 size={18} />,
    },
    {
      id: 'active',
      label: 'Active',
      value: activeDeliveries.toString(),
      badge: '~12 min ETA',
      badgeColor: 'blue',
      icon: <Navigation size={18} />,
    },
    {
      id: 'ai-interactions',
      label: 'AI Interactions',
      value: aiInteractions.toString(),
      badge: 'Assistant',
      badgeColor: 'indigo',
      icon: <Sparkles size={18} />,
    },
  ]

  return (
    <section className="overview-stats-grid" aria-label="Today's Overview">
      {stats.map((stat) => (
        <div key={stat.id} className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{stat.label}</span>
            <span className={`stat-badge badge-${stat.badgeColor}`}>
              {stat.badge}
            </span>
          </div>
          <div className="stat-card-bottom">
            <span className="stat-value">{stat.value}</span>
            <div className={`stat-icon-wrap icon-${stat.badgeColor}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}
