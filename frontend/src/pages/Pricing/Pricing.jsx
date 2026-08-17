import { Link } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import { ROUTES } from '../../constants'
import './Pricing.css'

const plans = [
  {
    name: 'Personal',
    price: 'Free',
    desc: 'For individuals getting started with crypto payments.',
    features: ['Send & receive payments', 'QR code payments', 'Transaction history', 'Basic wallet'],
  },
  {
    name: 'Merchant',
    price: '$9/mo',
    desc: 'For businesses accepting crypto payments.',
    features: ['All Personal features', 'Merchant dashboard', 'Payment API access', 'Fiat settlement', 'Priority support'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$49/mo',
    desc: 'For high-volume businesses and platforms.',
    features: ['All Merchant features', 'Custom integration', 'Dedicated account manager', 'SLA guarantee', 'Volume discounts'],
  },
]

export default function Pricing() {
  return (
    <div className="page-pricing container slide-up">
      <div className="pricing-header">
        <span className="section-label">Pricing</span>
        <h1 className="pricing-title">Simple, transparent pricing</h1>
        <p className="pricing-subtitle">No hidden fees. No surprises. Pay only for what you need.</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <Card key={plan.name} variant={plan.popular ? 'elevated' : 'simple'} className={`pricing-card ${plan.popular ? 'pricing-card--popular' : ''}`}>
            {plan.popular && <span className="pricing-badge">Most Popular</span>}
            <h3 className="pricing-plan-name">{plan.name}</h3>
            <div className="pricing-price">
              <span className="pricing-amount">{plan.price}</span>
            </div>
            <p className="pricing-desc">{plan.desc}</p>
            <ul className="pricing-features">
              {plan.features.map((f) => (
                <li key={f} className="pricing-feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to={ROUTES.REGISTER}>
              <Button variant={plan.popular ? 'primary' : 'secondary'} fullWidth>
                {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
