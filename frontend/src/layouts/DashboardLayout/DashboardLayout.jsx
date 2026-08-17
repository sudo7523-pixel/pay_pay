import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle'
import WalletStatus from '../../components/WalletStatus/WalletStatus'
import { ROUTES } from '../../constants'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import Dropdown, { DropdownItem } from '../../components/Dropdown/Dropdown'
import './DashboardLayout.css'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { success } = useToast()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    success('Logged out successfully')
    navigate(ROUTES.HOME)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="topbar-right">
            <WalletStatus compact />
            <ThemeToggle />
            <Dropdown
              trigger={
                <div className="topbar-avatar" title={user?.name || 'User'}>
                  {user?.name?.charAt(0) || '?'}
                </div>
              }
              align="right"
            >
              <DropdownItem onClick={() => navigate(ROUTES.PROFILE)}>
                Profile
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                Sign Out
              </DropdownItem>
            </Dropdown>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
