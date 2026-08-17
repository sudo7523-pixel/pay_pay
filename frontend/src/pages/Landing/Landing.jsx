import { Link } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Card from '../../components/Card/Card'
import { ROUTES } from '../../constants'
import './Landing.css'

const features = [
  { title: 'Instant Payments', desc: 'Send and receive USDC and XLM in seconds with near-zero fees.' },
  { title: 'QR Code Pay', desc: 'Tap or scan to pay at any merchant accepting PayStream.' },
  { title: 'Multi-currency', desc: 'Hold USDC, XLM, and more in a single non-custodial wallet.' },
  { title: 'Merchant Tools', desc: 'Accept crypto payments with automatic fiat settlement.' },
]

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up in under 30 seconds. No credit card needed.' },
  { num: '02', title: 'Fund Your Wallet', desc: 'Deposit USDC or XLM from any exchange or wallet.' },
  { num: '03', title: 'Pay or Get Paid', desc: 'Send money globally or accept payments at your business.' },
]

export default function Landing() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content slide-up">
            <span className="hero-badge">Built on Stellar</span>
            <h1 className="hero-title">
              Crypto payments,<br />
              <span className="hero-highlight">simplified.</span>
            </h1>
            <p className="hero-desc">
              PayStream makes sending and accepting crypto payments as easy as a tap.
              Powered by USDC and XLM on the Stellar network.
            </p>
            <div className="hero-actions">
              <Link to={ROUTES.REGISTER}>
                <Button size="lg" className="get-started">Get Started </Button>
              </Link>
              <Link to={ROUTES.ABOUT}>
                <Button variant="secondary" size="lg" className="learn-more">Learn More</Button>
              </Link>
            </div>
          </div>
          <div className="hero-visual slide-up" style={{ animationDelay: '0.2s' }} aria-hidden="true">
            <div className="hero-card-mock">
              <div className="mock-card-header">
                <div className="mock-dot" />
                <div className="mock-dot" />
                <div className="mock-dot" />
              </div>
              <div className="mock-card-body">
                <span className="mock-label">Balance</span>
                <span className="mock-amount">$12,450.82</span>
                <div className="mock-chips">
                  <span className="mock-chip">USDC</span>
                  <span className="mock-chip">XLM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="container">
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need for crypto payments</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <Card key={i} variant="elevated" className="feature-card slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {i === 0 && <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>}
                    {i === 1 && <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></>}
                    {i === 2 && <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>}
                    {i === 3 && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>}
                  </svg>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-label">How It Works</div>
          <h2 className="section-title">Get started in 3 simple steps</h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card slide-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <span className="step-number">{s.num}</span>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="container">
          <div className="section-label">Benefits</div>
          <h2 className="section-title">Why choose PayStream</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <h3>Near-zero fees</h3>
              <p>Stellar transactions cost fractions of a cent — no matter the amount.</p>
            </div>
            <div className="benefit-item">
              <h3>Global reach</h3>
              <p>Send money across borders instantly. No banks, no delays.</p>
            </div>
            <div className="benefit-item">
              <h3>Non-custodial</h3>
              <p>You control your keys. Your funds, your rules.</p>
            </div>
            <div className="benefit-item">
              <h3>Merchant ready</h3>
              <p>Accept crypto payments with automatic settlement in your preferred currency.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="merchant-section">
        <div className="container">
          <div className="merchant-cta slide-up">
            <div className="merchant-content">
              <span className="section-label">For Merchants</span>
              <h2 className="section-title">Accept crypto payments in minutes</h2>
              <p>Integrate PayStream into your business and start accepting USDC and XLM payments with instant settlement.</p>
              <Link to={ROUTES.REGISTER}>
                <Button variant="primary" size="lg">Become a Merchant</Button>
              </Link>
            </div>
            <div className="merchant-visual" aria-hidden="true">
              <div className="merchant-card-mock">
                <div className="mock-qr" />
                <div className="mock-line mock-line--short" />
                <div className="mock-line" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">Ready to simplify your payments?</h2>
            <p className="cta-desc">Join thousands of users and merchants already using PayStream.</p>
            <div className="cta-actions">
              <Link to={ROUTES.REGISTER}>
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button variant="secondary" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
