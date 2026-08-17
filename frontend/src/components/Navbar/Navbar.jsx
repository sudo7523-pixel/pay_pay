import { Link, useLocation } from 'react-router-dom'
import { ROUTES, APP_NAME } from '../../constants'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import Button from '../Button/Button'
import './Navbar.css'

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, isAuthenticated } = useAuth()
  const isHome = pathname === ROUTES.HOME
  const dashboardTo = user?.role === 'customer' ? ROUTES.CUSTOMER_DASHBOARD : ROUTES.DASHBOARD

  return (
    <header className={`navbar ${isHome ? 'navbar--transparent' : ''}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" aria-label={APP_NAME}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M10 16h12M16 10v12" stroke="var(--color-text-inverse)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="navbar-logo-text">{APP_NAME}</span>
        </Link>

        <nav className="navbar-nav" aria-label="Main navigation">
          <Link to={ROUTES.HOME} className="nav-link">Home</Link>
          <Link to={ROUTES.ABOUT} className="nav-link">About</Link>
          <Link to={ROUTES.PRICING} className="nav-link">Pricing</Link>
        </nav>

        <div className="navbar-actions">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link to={dashboardTo}>
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
