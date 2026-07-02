export const metadata = {
  title: 'Contact Us | EduPro',
};

export default function ContactPage() {
  return (
    <div className="article-container">
      <h1>Contact Us</h1>
      <div className="classified-box" style={{ marginTop: '2rem' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>If you have any questions, feedback, or business inquiries, please don't hesitate to reach out to our editorial team.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>Email Support</h2>
            <p><a href="mailto:asgharshah095@gmail.com" style={{ fontWeight: 700 }}>asgharshah095@gmail.com</a></p>
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>WhatsApp</h2>
            <p><a href="https://wa.me/923339852167" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>+92 333 9852167</a></p>
          </div>
          
          <div>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>Social Media</h2>
            <ul style={{ listStyle: 'none', marginLeft: 0, paddingLeft: 0, lineHeight: 2 }}>
              <li>📘 <a href="https://www.facebook.com/share/14goBeiQnvv/" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>Facebook Page</a></li>
              <li>📸 <a href="https://www.instagram.com/dawndigestcss?igsh=dm10djVpNHMwZHJ0" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>Instagram (@dawndigestcss)</a></li>
              <li>🎵 <a href="https://www.tiktok.com/@dawnbilingualinsights?_r=1&_t=ZS-97hfKV9OOwr" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700 }}>TikTok (@dawnbilingualinsights)</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
