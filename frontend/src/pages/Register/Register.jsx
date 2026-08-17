import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Card from '../../components/Card/Card'
import Badge from '../../components/Badge/Badge'
import { ROUTES, APP_NAME } from '../../constants'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import './Register.css'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { error, success } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

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
      await register(name, email, password)
      success('Account created successfully')
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      if (err.errors?.length) {
        err.errors.forEach((e) => error(e.message || e.msg))
      } else {
        error(err.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-register">
      <Card className="register-card">
        <div className="register-header">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path d="M10 16h12M16 10v12" stroke="var(--color-text-inverse)" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="register-badge">
            <Badge variant="info">Merchant Account</Badge>
          </div>
          <h1 className="register-title">Create Merchant Account</h1>
          <p className="register-subtitle">
            Register to accept crypto payments, manage your dashboard, and track sales analytics
          </p>
        </div>
        <form onSubmit={handleSubmit} className="register-form">
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
            Register as Merchant
          </Button>
        </form>
        <div className="register-footer">
          <p>Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link></p>
          <p className="register-footer-alt">
            Want to send payments instead?{' '}
            <Link to="/customer/register">Sign up as Customer</Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
