import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Card from '../../components/Card/Card'
import { ROUTES, APP_NAME } from '../../constants'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { setItem } from '../../utils/storage'
import { TOKEN_STORAGE_KEY } from '../../config/env'
import * as customerService from '../../services/customerService'
import './CustomerRegister.css'

export default function CustomerRegister() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  const { error, success } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const redirect = searchParams.get('redirect') || ROUTES.CUSTOMER_DASHBOARD

  function validate() {
    const errs = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email.trim()) errs.email = 'Email is required'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await customerService.register(name, email, password)
      setItem(TOKEN_STORAGE_KEY, res.token)
      setUser(res.customer.user)
      success('Account created successfully')
      navigate(redirect, { replace: true })
    } catch (err) {
      error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-customer-register">
      <Card className="customer-register-card">
        <div className="customer-register-header">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M10 16h12M16 10v12" stroke="var(--color-text-inverse)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h1 className="customer-register-title">Create Customer Account</h1>
          <p className="customer-register-subtitle">
            Send XLM payments by scanning merchant QR codes. Track your payment history and view receipts.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="customer-register-form">
          <Input
            label="Full Name"
            type="text"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />
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
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          <Button type="submit" fullWidth loading={loading}>
            Create Customer Account
          </Button>
        </form>
        <div className="customer-register-footer">
          <p>Already have an account? <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}>Sign in</Link></p>
          <p className="customer-register-footer-alt">
            Want to accept payments instead?{' '}
            <Link to={`/register?redirect=${encodeURIComponent(redirect)}`}>Register as Merchant</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
