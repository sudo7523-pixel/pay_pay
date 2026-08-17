import { NavLink } from 'react-router-dom'
import { ROUTES, APP_NAME } from '../../constants'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import './Sidebar.css'

const customerLinks = [
  { to: ROUTES.CUSTOMER_DASHBOARD, label: 'My Payments', icon: 'credit-card' },
  { to: ROUTES.WALLET, label: 'Wallet', icon: 'wallet' },
  { to: ROUTES.PROFILE, label: 'Profile', icon: 'user' },
]

const merchantLinks = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'grid' },
  { to: ROUTES.WALLET, label: 'Wallet', icon: 'wallet' },
  { to: ROUTES.MERCHANT, label: 'Merchant', icon: 'briefcase' },
  { to: ROUTES.TRANSACTIONS, label: 'Transactions', icon: 'arrow-left-right' },
  { to: ROUTES.PROFILE, label: 'Profile', icon: 'user' },
  { to: ROUTES.QR, label: 'QR Code', icon: 'qr-code' },
]

function SvgIcon({ name }) {
  const icons = {
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    wallet: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 12h4" /></>,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></>,
    'arrow-left-right': <><path d="M17 17l4-4-4-4M7 7l-4 4 4 4" /><path d="M21 13H3" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 00-16 0" /></>,
    'qr-code': <><rect x="3" y="3" width="6" height="6" /><rect x="15" y="3" width="6" height="6" /><rect x="3" y="15" width="6" height="6" /><rect x="15" y="15" width="6" height="6" /><path d="M15 11h2v2M19 11h2v2M11 15h2v2M11 19h2v2" /></>,
    'credit-card': <><rect x="2" y="7" width="20" height="13" rx="2" /><path d="M2 11h20" /><path d="M7 16h3" /></>,
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name]}
    </svg>
  )
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const links = user?.role === 'customer' ? customerLinks : merchantLinks
  const brandTo = user?.role === 'customer' ? ROUTES.CUSTOMER_DASHBOARD : ROUTES.DASHBOARD

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to={brandTo} className="sidebar-brand" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M10 16h12M16 10v12" stroke="var(--color-text-inverse)" strokeWidth="3" strokeLinecap="round" />
            </svg>
            {APP_NAME}
          </NavLink>
        </div>
        <nav className="sidebar-nav" aria-label="Sidebar navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
              onClick={onClose}
            >
              <SvgIcon name={link.icon} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <ThemeToggle />
        </div>
      </aside>
    </>
  )
}
