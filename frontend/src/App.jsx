import { useState, useEffect } from 'react'
import Sidebar from './components/sidebar'
import Dashboard from './components/Dashboard'
import PlaceholderRoute from './components/PlaceholderRoute'
import { ThemeProvider } from './context/ThemeContext'
import { MessageSquare, Package, User, Settings, HelpCircle, ThumbsUp } from 'lucide-react'
import './App.css'

function AppContent() {
  // Client route handling via hash (#/dashboard, #/messages, etc.)
  const getRouteFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '')
    return hash || 'dashboard'
  }

  const [activeRoute, setActiveRoute] = useState(getRouteFromHash)

  useEffect(() => {
    const handleHashChange = () => {
      setActiveRoute(getRouteFromHash())
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleNavigate = (routeId) => {
    setActiveRoute(routeId)
    window.location.hash = `#/${routeId}`
  }

  // Stub route metadata resolver
  const getStubMeta = (id) => {
    switch (id) {
      case 'messages':
        return {
          title: 'Dispatch & Customer Messages',
          description: 'Two-way voice-to-text messaging with dispatch coordinators and customers is slated for release in v2.5.',
          icon: <MessageSquare size={32} />,
        }
      case 'deliveries':
        return {
          title: 'Shift Deliveries & Order History',
          description: 'Comprehensive historical logs, delivery run manifests, and earnings summaries will be available in v2.5.',
          icon: <Package size={32} />,
        }
      case 'profile':
        return {
          title: 'Rider Profile & Performance',
          description: 'Rider safety rating, efficiency metrics, shift preferences, and vehicle diagnostics coming in v2.5.',
          icon: <User size={32} />,
        }
      case 'settings':
        return {
          title: 'System & Headset Settings',
          description: 'Audio sensitivity, turn-by-turn voice model configuration, and HUD display options coming in v2.5.',
          icon: <Settings size={32} />,
        }
      case 'help':
        return {
          title: 'Help & Emergency Support',
          description: '24/7 road assistance, dispatch emergency line, and rider documentation coming in v2.5.',
          icon: <HelpCircle size={32} />,
        }
      case 'feedback':
        return {
          title: 'Rider Experience Feedback',
          description: 'Direct feedback channel to the Rider AI assistant engineering team.',
          icon: <ThumbsUp size={32} />,
        }
      default:
        return {
          title: 'Module Under Construction',
          description: 'This section is currently being developed for Rider AI Assistant.',
          icon: null,
        }
    }
  }

  return (
    <div className="app-shell">
      <Sidebar activeRoute={activeRoute} onNavigate={handleNavigate} />
      <main className="app-main">
        <div className="app-main-inner">
          {/* Main Operational Dashboard */}
          {(activeRoute === 'dashboard' || activeRoute === 'events' || activeRoute === 'assistant') ? (
            <Dashboard />
          ) : (
            /* Graceful Stub Routes */
            <PlaceholderRoute
              {...getStubMeta(activeRoute)}
              onBackToDashboard={() => handleNavigate('dashboard')}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

