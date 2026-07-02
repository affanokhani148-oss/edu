'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FooterClient({ settings }) {
  const pathname = usePathname();

  // Hide footer on dashboard routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/student')) {
    return null;
  }

  const s = settings || {};

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <span className="footer-brand">{s.logoText || 'EduPro'}</span>
          <p className="footer-desc">Premium CSS/PMS study communities with daily editorials, GRE words, idioms, pair of words, essays and interactive quizzes.</p>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            💳 Easypaisa: <strong style={{ color: 'var(--text-secondary)' }}>0333985267</strong> — Syed Azam Shah
          </p>
        </div>
        <div>
          <p className="footer-heading">Navigate</p>
          <div className="footer-links">
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Student Login</Link>
          </div>
        </div>
        <div>
          <p className="footer-heading">Legal</p>
          <div className="footer-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-text">© {new Date().getFullYear()} {s.logoText || 'EduPro'} — CSS/PMS Premium Study Communities. All rights reserved.</p>
        <p className="footer-text">AdSense Policy Compliant · SEO Optimized</p>
      </div>
    </footer>
  );
}
