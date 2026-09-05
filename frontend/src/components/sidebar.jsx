import { useState, useRef } from 'react'
import { Waypoints } from 'lucide-react'
import './sidebar.css'

/* ==========================================================================
   1. SVG ICONS
   Clean, reusable outline icons used across the sidebar.
   ========================================================================== */
const Icons = {
  SidebarToggle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <line x1="14" y1="3" x2="14" y2="21" />
      <line x1="7" y1="9.5" x2="10.5" y2="9.5" />
      <line x1="7" y1="14.5" x2="10.5" y2="14.5" />
    </svg>
  ),
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="7" height="9" x="3" y="3" rx="1.5" />
      <rect width="7" height="5" x="14" y="3" rx="1.5" />
      <rect width="7" height="9" x="14" y="12" rx="1.5" />
      <rect width="7" height="5" x="3" y="16" rx="1.5" />
    </svg>
  ),
  LiveEvents: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Messages: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Assistant: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  ),
  Deliveries: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  RiderProfile: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Pin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  ChatBubble: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 2-2 2m-1.5 1.5L14 9m-2 2-3 3-2.5-2.5a5.5 5.5 0 1 0 7.5 7.5L21 12V8l-3-3-3 3" />
      <circle cx="7.5" cy="16.5" r="1.5" />
    </svg>
  ),
  Megaphone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  ),
  Help: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  ),
  Feedback: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
}

/* ==========================================================================
   2. NAVIGATION DATA
   Easily add, remove, or edit sidebar links from these simple arrays.
   ========================================================================== */
const PRIMARY_NAV = [
  { id: 'dashboard',  label: 'Dashboard',     icon: <Icons.Dashboard /> },
  { id: 'events',     label: 'Live Events',   icon: <Icons.LiveEvents /> },
  { id: 'messages',   label: 'Messages',      icon: <Icons.Messages /> },
  { id: 'assistant',  label: 'Assistant',     icon: <Icons.Assistant /> },
  { id: 'deliveries', label: 'Deliveries',    icon: <Icons.Deliveries /> },
  { id: 'profile',    label: 'Rider Profile', icon: <Icons.RiderProfile /> },
  { id: 'settings',   label: 'Settings',      icon: <Icons.Settings /> },
]

const TEST_EVENTS = [
  { id: 'nav-event',     label: 'Navigation Event', icon: <Icons.Pin />,        tagColor: 'teal' },
  { id: 'customer-msg',  label: 'Customer Message', icon: <Icons.ChatBubble />, tagColor: 'indigo' },
  { id: 'customer-call', label: 'Customer Call',    icon: <Icons.Phone />,      tagColor: 'blue' },
  { id: 'otp-event',     label: 'OTP Event',        icon: <Icons.Key />,        tagColor: 'amber' },
  { id: 'manager-msg',   label: 'Manager Message',  icon: <Icons.Megaphone />,  tagColor: 'rose' },
]

const FOOTER_NAV = [
  { id: 'help',     label: 'Help & Support', icon: <Icons.Help /> },
  { id: 'feedback', label: 'Feedback',       icon: <Icons.Feedback /> },
]

// Tooltip lookup mapping for collapsed mode
const TOOLTIP_LABELS = {
  dashboard: 'Dashboard',
  events: 'Live Events',
  messages: 'Messages',
  assistant: 'Assistant',
  deliveries: 'Deliveries',
  profile: 'Rider Profile',
  settings: 'Settings',
  'nav-event': 'Navigation Event',
  'customer-msg': 'Customer Message',
  'customer-call': 'Customer Call',
  'otp-event': 'OTP Event',
  'manager-msg': 'Manager Message',
  help: 'Help & Support',
  feedback: 'Feedback',
}

/* ==========================================================================
   3. HELPER COMPONENTS
   ========================================================================== */

/**
 * Tooltip wrapper: Displays a floating label only when the sidebar is collapsed
 */
function Tooltip({ itemId, showTooltip, children }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setVisible(true), 150)
  }

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }

  return (
    <div
      className={`tooltip-wrapper${!showTooltip ? ' tooltip-disabled' : ''}`}
      onMouseEnter={showTooltip ? handleMouseEnter : undefined}
      onMouseLeave={showTooltip ? handleMouseLeave : undefined}
    >
      {children}
      {showTooltip && visible && (
        <div className="tooltip" role="tooltip">
          {TOOLTIP_LABELS[itemId]}
        </div>
      )}
    </div>
  )
}

/* ==========================================================================
   4. MAIN SIDEBAR COMPONENT
   ========================================================================== */
export default function Sidebar() {
  // Current active page ID
  const [activeId, setActiveId] = useState('dashboard')

  // Sidebar collapse states:
  // - isCollapsed: whether the user clicked to collapse the sidebar into a rail
  // - isHoverExpanded: temporary expansion when hovering over the collapsed rail
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHoverExpanded, setIsHoverExpanded] = useState(false)
  const hoverTimerRef = useRef(null)

  // Full width is active if not collapsed OR if temporarily hovered
  const isExpanded = !isCollapsed || isHoverExpanded
  // Tooltips are shown only when in narrow collapsed mode
  const showTooltip = isCollapsed && !isHoverExpanded

  // Expand with a tiny delay on mouse enter
  const handleMouseEnter = () => {
    if (isCollapsed) {
      hoverTimerRef.current = setTimeout(() => setIsHoverExpanded(true), 50)
    }
  }

  // Collapse back immediately on mouse leave
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    if (isCollapsed) setIsHoverExpanded(false)
  }

  // Toggle button click handler
  const toggleSidebar = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    setIsCollapsed(!isCollapsed)
    setIsHoverExpanded(false)
  }

  return (
    <aside
      className={`saas-sidebar${isExpanded ? '' : ' is-collapsed'}`}
      aria-label="Sidebar navigation"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ── Header: Logo & Collapse Button ── */}
      <div className="sidebar-brand-row">
        <div className="sidebar-brand">
          <div className="brand-asterisk-icon" aria-hidden="true">
            <Waypoints size={26} strokeWidth={2.2} />
          </div>
          <span className="brand-name">Rider AI</span>
        </div>

        <button
          type="button"
          className="brand-toggle-btn"
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          onClick={toggleSidebar}
        >
          {isExpanded ? <Icons.SidebarToggle /> : <Icons.ChevronRight />}
        </button>
      </div>

      {/* ── Top Profile Card ── */}
      <div className="sidebar-top-profile-container">
        <button
          type="button"
          className="top-user-profile-card"
          aria-label="User Account Menu"
        >
          <div className="top-user-avatar-wrapper">
            <div className="top-user-avatar">
              <svg viewBox="0 0 36 36" fill="none" className="avatar-art" aria-hidden="true">
                <defs>
                  <linearGradient id="riderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="50%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                  </linearGradient>
                </defs>
                <circle cx="18" cy="18" r="18" fill="url(#riderGrad)" />
                <circle cx="18" cy="14" r="7" fill="#0f172a" />
                <path d="M12 14c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="#38bdf8" opacity="0.9" />
                <rect x="13" y="13" width="10" height="3" rx="1.5" fill="#38bdf8" />
                <path d="M8 32c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="#0f172a" />
              </svg>
            </div>
            <span className="top-user-online-dot" aria-hidden="true" />
          </div>

          <div className="top-user-details">
            <span className="top-user-name">Rider 01</span>
            <span className="top-user-status">Online</span>
          </div>

          <span className="top-user-chevron">
            <Icons.ChevronDown />
          </span>
        </button>
      </div>

      {/* ── Middle Scrollable Menu ── */}
      <div className="sidebar-scroll-area">
        {/* Primary Navigation */}
        <nav className="nav-group" aria-label="Main Menu">
          <ul className="nav-menu-list">
            {PRIMARY_NAV.map((item) => {
              const isActive = activeId === item.id
              return (
                <li key={item.id} className="nav-menu-item">
                  <Tooltip itemId={item.id} showTooltip={showTooltip}>
                    <button
                      type="button"
                      className={`nav-button ${isActive ? 'is-active' : ''}`}
                      onClick={() => setActiveId(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="nav-item-icon">{item.icon}</span>
                      <span className="nav-item-label">{item.label}</span>
                      {item.badge && (
                        <span className="nav-item-badge">{item.badge}</span>
                      )}
                    </button>
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Test Events Section */}
        <div className="sidebar-section-divider" />
        <div className="test-events-group">
          <div className="section-header-row">
            <span className="section-heading-text">TEST EVENTS</span>
            <button
              type="button"
              className="section-add-btn"
              aria-label="Add new test event"
              title="Add event"
            >
              <Icons.Plus />
            </button>
          </div>

          <ul className="nav-menu-list">
            {TEST_EVENTS.map((item) => {
              const isActive = activeId === item.id
              return (
                <li key={item.id} className="nav-menu-item">
                  <Tooltip itemId={item.id} showTooltip={showTooltip}>
                    <button
                      type="button"
                      className={`nav-button test-event-button ${isActive ? 'is-active' : ''}`}
                      onClick={() => setActiveId(item.id)}
                    >
                      <span className={`event-icon-container tint-${item.tagColor}`}>
                        {item.icon}
                      </span>
                      <span className="nav-item-label">{item.label}</span>
                    </button>
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* ── Bottom Secondary Links ── */}
      <div className="sidebar-footer-region">
        <ul className="nav-menu-list compact-footer-list">
          {FOOTER_NAV.map((item) => {
            const isActive = activeId === item.id
            return (
              <li key={item.id} className="nav-menu-item">
                <Tooltip itemId={item.id} showTooltip={showTooltip}>
                  <button
                    type="button"
                    className={`nav-button footer-link-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveId(item.id)}
                  >
                    <span className="nav-item-icon secondary-icon">{item.icon}</span>
                    <span className="nav-item-label">{item.label}</span>
                  </button>
                </Tooltip>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}

