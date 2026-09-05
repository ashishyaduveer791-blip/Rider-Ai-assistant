import Sidebar from './components/sidebar'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="app-main-inner">
          <h1>Dashboard</h1>
          <p>Pick a section from the sidebar to get started.</p>
        </div>
      </main>
    </div>
  )
}

export default App
