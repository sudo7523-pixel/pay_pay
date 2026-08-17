import './About.css'

export default function About() {
  return (
    <div className="page-about container slide-up">
      <div className="about-header">
        <span className="section-label">About</span>
        <h1 className="about-title">The future of payments on Stellar</h1>
        <p className="about-subtitle">
          PayStream is a non-custodial payment platform that lets anyone send, receive, and accept
          USDC and XLM payments with near-zero fees and instant settlement.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <h2>Our Mission</h2>
          <p>To make crypto payments as simple and accessible as traditional banking — without the fees, delays, or gatekeepers.</p>
        </div>
        <div className="about-card">
          <h2>Why Stellar</h2>
          <p>Stellar's decentralized network enables fast, low-cost cross-border transactions. Built for real-world payments.</p>
        </div>
        <div className="about-card">
          <h2>Security First</h2>
          <p>We never hold your private keys. Your wallet, your control. Everything is secured by the Stellar blockchain.</p>
        </div>
        <div className="about-card">
          <h2>Open Source</h2>
          <p>Transparency is core to our values. PayStream is built in the open, with community contributions welcome.</p>
        </div>
      </div>
    </div>
  )
}
