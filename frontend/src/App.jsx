import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { BlockchainProvider } from './context/BlockchainContext'
import { ToastProvider } from './context/ToastContext'
import { WalletProvider } from './context/WalletContext'
import { ModalProvider } from './context/ModalContext'
import { LoadingProvider } from './context/LoadingContext'
import { router } from './router'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BlockchainProvider>
          <ToastProvider>
            <WalletProvider>
              <ModalProvider>
                <LoadingProvider>
                  <RouterProvider router={router} />
                </LoadingProvider>
              </ModalProvider>
            </WalletProvider>
          </ToastProvider>
        </BlockchainProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
