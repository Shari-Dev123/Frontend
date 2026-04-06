import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, Briefcase, MessageSquare, User } from 'lucide-react'
import { useEffect } from 'react'
import { initializeTracking } from '../utils/tracking'

const WorkerLayout = () => {
  const { user } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Start background tracking
    const cleanup = initializeTracking()
    return cleanup
  }, [])

  const navItems = [
    { path: '/worker', icon: Home, label: 'Home' },
    { path: '/worker/jobs', icon: Briefcase, label: 'Jobs' },
    { path: '/worker/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/worker/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="worker-layout">
      {/* Tracking Indicator */}
      <div className="tracking-overlay">
        <span className="tracking-pulse"></span>
        Location tracking active
      </div>

      {/* Header */}
      <header className="worker-header">
        <div className="worker-header-content">
          <div className="worker-greeting">
            Hello, <span>{user?.name?.split(' ')[0]}</span>
          </div>
          <div className="worker-status">
            <span className="status-indicator"></span>
            Online
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="worker-container">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="worker-nav">
        <div className="worker-nav-list">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/worker'}
              className={({ isActive }) => `worker-nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="worker-nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default WorkerLayout