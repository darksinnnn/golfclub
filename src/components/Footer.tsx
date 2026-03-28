import Link from 'next/link';
import { Zap, Globe, Heart } from '@/components/Icons';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <div className="navbar-logo">
                <Zap size={18} />
              </div>
              <span>Golf Heroes</span>
            </Link>
            <p className="footer-tagline">
              Play with purpose. Every round matters.
            </p>
          </div>
          <div>
            <h4 className="footer-heading">Platform</h4>
            <Link href="/how-it-works" className="footer-link">How It Works</Link>
            <Link href="/pricing" className="footer-link">Pricing</Link>
            <Link href="/charities" className="footer-link">Charities</Link>
          </div>
          <div>
            <h4 className="footer-heading">Account</h4>
            <Link href="/auth/login" className="footer-link">Log In</Link>
            <Link href="/auth/signup" className="footer-link">Sign Up</Link>
            <Link href="/dashboard" className="footer-link">Dashboard</Link>
          </div>
          <div>
            <h4 className="footer-heading">Connect</h4>
            <a href="#" className="footer-link"><Globe size={14} style={{ display: 'inline', marginRight: 6 }} />Website</a>
            <a href="#" className="footer-link"><Heart size={14} style={{ display: 'inline', marginRight: 6 }} />Support</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Golf Heroes. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
