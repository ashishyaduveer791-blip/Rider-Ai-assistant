import { Component } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

/**
 * ErrorBoundary — Catches uncaught React rendering errors and displays
 * a graceful fallback UI instead of a blank white screen.
 *
 * Wrap this around <App /> or major page sections to ensure
 * a single component crash doesn't take down the entire application.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log to console in development; in production, send to error tracking service
    console.error('[ErrorBoundary] Caught rendering error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Allow custom fallback UI via props
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconWrap}>
              <AlertTriangle size={32} style={styles.icon} />
            </div>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.description}>
              The Rider AI Assistant encountered an unexpected error. Your data is safe —
              try recovering or reload the page.
            </p>
            {this.state.error && (
              <pre style={styles.errorDetail}>
                {this.state.error.message || 'Unknown error'}
              </pre>
            )}
            <div style={styles.actions}>
              <button onClick={this.handleReset} style={styles.btnPrimary}>
                <RotateCcw size={14} />
                <span>Try to Recover</span>
              </button>
              <button onClick={this.handleReload} style={styles.btnSecondary}>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    padding: '40px 32px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)',
    textAlign: 'center',
  },
  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    backgroundColor: '#fef2f2',
    marginBottom: '20px',
  },
  icon: {
    color: '#ef4444',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 8px',
  },
  description: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#64748b',
    margin: '0 0 16px',
  },
  errorDetail: {
    fontSize: '12px',
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '10px 14px',
    margin: '0 0 20px',
    overflowX: 'auto',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
}
