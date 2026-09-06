import { useState, useEffect } from 'react'
import { Bell, Sparkles, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function DashboardHeader({ assistantState }) {
  const { isDark, toggleTheme } = useTheme()
  const [timeString, setTimeString] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const formatted = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }) + ' • ' + now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      setTimeString(formatted)
    }

    updateTime()
    const timer = setInterval(updateTime, 1000 * 30)
    return () => clearInterval(timer)
  }, [])

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(2)

  const notifications = [
    {
      id: 'notif-1',
      title: 'Route Alert',
      desc: 'Traffic bottleneck detected near Nanda Ki Chowki. Bidholi Road UPES bypass recommended.',
      time: '4m ago',
      type: 'alert',
    },
    {
      id: 'notif-2',
      title: 'Shift Incentive Active',
      desc: '+₹40 surge bonus applied per delivery for the next 2 hours.',
      time: '18m ago',
      type: 'bonus',
    },
    {
      id: 'notif-3',
      title: 'Order Status Update',
      desc: 'Customer Rahul Sharma verified delivery instructions: front door drop-off.',
      time: '28m ago',
      type: 'info',
    },
  ]

  const handleToggleNotifications = () => {
    setShowNotifications((prev) => !prev)
    if (unreadCount > 0) {
      setUnreadCount(0)
    }
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="header-title-row">
          <h1 className="header-greeting">{getGreeting()}, Rider 01</h1>
          <div className="assistant-online-chip" title={`Assistant is ${assistantState}`}>
            <span className="online-pulse-pip" aria-hidden="true" />
            <span className="online-chip-text">Assistant Online</span>
          </div>
        </div>
        <p className="header-subtitle">Here's what's happening with your deliveries.</p>
      </div>

      <div className="header-right">
        {/* Date & Time pill */}
        <div className="header-datetime-badge">
          <span className="datetime-text">{timeString || 'Today'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="header-action-btn theme-toggle-btn"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleTheme}
        >
          {isDark ? <Sun size={18} className="theme-icon-sun" /> : <Moon size={18} className="theme-icon-moon" />}
        </button>

        {/* Notifications Icon Button with interactive dropdown */}
        <div className="notifications-popover-anchor">
          <button
            type="button"
            className={`header-action-btn ${showNotifications ? 'is-active' : ''}`}
            aria-label="Notifications"
            title="Notifications"
            onClick={handleToggleNotifications}
            aria-expanded={showNotifications}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge-dot" />}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown-menu" role="dialog" aria-label="Recent notifications">
              <div className="notif-dropdown-header">
                <span className="notif-dropdown-title">Shift Notifications</span>
                <span className="notif-dropdown-count">3 total</span>
              </div>
              <ul className="notif-list">
                {notifications.map((n) => (
                  <li key={n.id} className="notif-item">
                    <div className="notif-item-top">
                      <span className="notif-item-title">{n.title}</span>
                      <span className="notif-item-time">{n.time}</span>
                    </div>
                    <p className="notif-item-desc">{n.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Compact Rider Avatar */}
        <div className="header-rider-avatar" title="Rider 01 (Active)">
          <svg viewBox="0 0 36 36" fill="none" className="header-avatar-art" aria-hidden="true">
            <defs>
              <linearGradient id="headerRiderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="18" r="18" fill="url(#headerRiderGrad)" />
            <circle cx="18" cy="14" r="7" fill="#0f172a" />
            <path d="M12 14c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#38bdf8" opacity="0.9" />
            <rect x="13" y="13" width="10" height="3" rx="1.5" fill="#38bdf8" />
            <path d="M8 32c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="#0f172a" />
          </svg>
        </div>
      </div>
    </header>
  )
}
