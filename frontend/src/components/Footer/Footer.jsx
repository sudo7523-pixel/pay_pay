import { Link } from 'react-router-dom'
import { ROUTES, APP_NAME } from '../../constants'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M10 16h12M16 10v12" stroke="var(--color-text-inverse)" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span>{APP_NAME}</span>
          </div>
          <p className="footer-tagline">
            The modern way to pay with crypto on Stellar.
          </p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Product</h4>
            <Link to={ROUTES.PRICING}>Pricing</Link>
            <Link to={ROUTES.ABOUT}>About</Link>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <Link to="/">Documentation</Link>
            <Link to="/">Support</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link to="/">Privacy</Link>
            <Link to="/">Terms</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom container">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </div>
    </footer>
  )
}
