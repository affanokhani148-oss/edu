'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FooterClient({ settings }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname.startsWith('/student')) {
    return null;
  }

  const s = settings || {};

  return (
    <footer className="news-footer container">
      <div className="news-footer-grid">
        <div>
          <span className="news-brand" style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>
            Edu<span style={{ color: 'var(--color-primary)' }}>Pro</span>
          </span>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Pakistan's premier daily source for CSS and PMS preparation material, editorials, and interactive quizzes.
          </p>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <strong>Easypaisa:</strong> <span style={{ color: 'var(--color-text-primary)' }}>0333985267</span><br/>
            (Syed Azam Shah)
          </p>
        </div>
        <div>
          <h4>Sections</h4>
          <ul className="news-footer-links">
            <li><Link href="/">Front Page</Link></li>
            <li><Link href="#latest">Latest Notes</Link></li>
            <li><Link href="#editorials">Editorials</Link></li>
            <li><Link href="#communities">Classifieds (Pricing)</Link></li>
          </ul>
        </div>
        <div>
          <h4>Services</h4>
          <ul className="news-footer-links">
            <li><Link href="/login">Student Desk Login</Link></li>
            <li><Link href="/about">About the Publisher</Link></li>
            <li><Link href="/contact">Contact the Editor</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contact & Social</h4>
          <ul className="news-footer-links">
            <li><a href="mailto:asgharshah095@gmail.com">📧 asgharshah095@gmail.com</a></li>
            <li><a href="https://wa.me/923339852167" target="_blank" rel="noopener noreferrer">💬 WhatsApp: 03339852167</a></li>
            <li><a href="https://www.facebook.com/share/14goBeiQnvv/" target="_blank" rel="noopener noreferrer">📘 Facebook Page</a></li>
            <li><a href="https://www.instagram.com/dawndigestcss?igsh=dm10djVpNHMwZHJ0" target="_blank" rel="noopener noreferrer">📸 Instagram</a></li>
            <li><a href="https://www.tiktok.com/@dawnbilingualinsights?_r=1&_t=ZS-97hfKV9OOwr" target="_blank" rel="noopener noreferrer">🎵 TikTok</a></li>
          </ul>
        </div>
      </div>
      
      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
        <span>© {new Date().getFullYear()} {s.logoText || 'EduPro'} Publisher. All rights reserved.</span>
        <span>AdSense Compliant Edition</span>
      </div>
    </footer>
  );
}
