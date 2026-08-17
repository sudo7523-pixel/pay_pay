import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Card from '../../components/Card/Card'
import { ROUTES, APP_NAME } from '../../constants'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const { error } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const redirect = searchParams.get('redirect') || ROUTES.DASHBOARD

  function validate() {
    const errs = {}
    if (!email.trim()) errs.email = 'Email is required'
    if (!password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await login(email, password)
      navigate(redirect, { replace: true })
    } catch (err) {
      error(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-login">
      <Card className="login-card">
        <div className="login-header">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M10 16h12M16 10v12" stroke="var(--color-text-inverse)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your {APP_NAME} account</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            Sign In
          </Button>
        </form>
        <div className="login-footer">
          <p className="login-footer-title">Don't have an account?</p>
          <div className="login-footer-links">
            <Link to={`/customer/register?redirect=${encodeURIComponent(redirect)}`} className="login-role-link">
              <span className="login-role-icon">&#9654;</span>
              <span className="login-role-text">
                <strong>Sign up as Customer</strong>
                <small>Send payments, scan QR codes, track history</small>
              </span>
            </Link>
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`} className="login-role-link">
              <span className="login-role-icon">&#8982;</span>
              <span className="login-role-text">
                <strong>Sign up as Merchant</strong>
                <small>Accept payments, manage dashboard, view analytics</small>
              </span>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
