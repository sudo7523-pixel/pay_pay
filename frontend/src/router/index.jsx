import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import GuestRoute from '../components/GuestRoute'
import CustomerRoute from '../components/CustomerRoute'

import Landing from '../pages/Landing/Landing'
import About from '../pages/About/About'
import Pricing from '../pages/Pricing/Pricing'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import NotFound from '../pages/NotFound/NotFound'
import Dashboard from '../pages/Dashboard/Dashboard'
import Wallet from '../pages/Wallet/Wallet'
import Merchant from '../pages/Merchant/Merchant'
import Transactions from '../pages/Transactions/Transactions'
import Profile from '../pages/Profile/Profile'
import QR from '../pages/QR/QR'
import Pay from '../pages/Pay/Pay'
import CustomerRegister from '../pages/CustomerRegister/CustomerRegister'
import CustomerDashboard from '../pages/CustomerDashboard/CustomerDashboard'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/about', element: <About /> },
      { path: '/pricing', element: <Pricing /> },
      {
        element: <GuestRoute />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
          { path: '/customer/register', element: <CustomerRegister /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/wallet', element: <Wallet /> },
          { path: '/merchant', element: <Merchant /> },
          { path: '/transactions', element: <Transactions /> },
          { path: '/profile', element: <Profile /> },
          { path: '/qr', element: <QR /> },
        ],
      },
    ],
  },
  {
    element: <CustomerRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/customer/dashboard', element: <CustomerDashboard /> },
        ],
      },
    ],
  },
  { path: '/pay/:merchantCode', element: <Pay /> },
  { path: '*', element: <NotFound /> },
])
