import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const steps = [
  { num: '01', title: 'Scan & Open',   desc: 'Scan QR code outside the shop' },
  { num: '02', title: 'Upload Photos', desc: 'Upload all your photos at once' },
  { num: '03', title: 'Pick Services', desc: 'Passport, prints, lamination & more' },
  { num: '04', title: 'Pay & Relax',   desc: 'Pay via UPI · WhatsApp alert when ready' },
];

// Marquee CSS injected once
const MARQUEE_CSS = `
@keyframes marquee-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  animation: marquee-scroll 30s linear infinite;
  width: max-content;
}
.marquee-track:hover { animation-play-state: paused; }
`;

export default function HomePage() {
  const [services, setServices]   = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [shopInfo, setShopInfo]   = useState({ name: 'Usha Photo Studio' });
  const [about, setAbout]         = useState(null);
  const [svcLoading, setSvcLoading] = useState(true);

  useEffect(() => {
    api.get('/settings/services').then(({ data }) => { setServices(data); setSvcLoading(false); }).catch(() => setSvcLoading(false));
    api.get('/portfolio?category=all').then(({ data }) => setPortfolio(data)).catch(() => {});
    api.get('/settings/shop-info').then(({ data }) => setShopInfo(data)).catch(() => {});
    api.get('/about').then(({ data }) => setAbout(data)).catch(() => {});
  }, []);

  // Duplicate for seamless marquee loop
  const marqueeItems = [...portfolio, ...portfolio];

  return (
    <div>
      <style>{MARQUEE_CSS}</style>

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(212,175,55,0.08) 0%, transparent 70%)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.3 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '100px 20px 60px' }}>
          <div className="fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '6px 18px', fontSize: '13px', color: 'var(--gold)', marginBottom: '32px' }}>
            📸 Smart Photo Studio · Order Online
          </div>
          <h1 className="fade-in fade-in-delay-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 8vw, 80px)', lineHeight: 1.1, marginBottom: '24px', fontWeight: 900 }}>
            Skip the Queue.<br /><span style={{ color: 'var(--gold)' }}>Not the Photos.</span>
          </h1>
          <p className="fade-in fade-in-delay-2" style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 48px', lineHeight: 1.7 }}>
            Passport photos, prints, lamination &amp; more — order online, pay via UPI, get WhatsApp notification when ready.
          </p>
          <div className="fade-in fade-in-delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/order" className="btn btn-primary btn-lg">📤 Place Your Order</Link>
            <Link to="/track" className="btn btn-outline btn-lg">🔍 Track Order</Link>
          </div>
          {(shopInfo.phone || shopInfo.hours || shopInfo.address) && (
            <div className="fade-in" style={{ marginTop: '28px', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {shopInfo.phone   && <span>📞 {shopInfo.phone}</span>}
              {shopInfo.hours   && <span>🕐 {shopInfo.hours}</span>}
              {shopInfo.address && <span>📍 {shopInfo.address}</span>}
            </div>
          )}
          <div className="fade-in" style={{ display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '64px', flexWrap: 'wrap' }}>
            {[['No Waiting','Skip queues completely'],['UPI Payment','GPay, PhonePe, Paytm'],['Instant Alert','WhatsApp + SMS']].map(([t,s]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)', fontWeight: 700 }}>{t}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT US ══════════════════════════════════════════════ */}
      {about && (about.description || about.imageUrl) && (
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: about.imageUrl ? '1fr 1fr' : '1fr', gap: '48px', alignItems: 'center' }}>
              {/* Photo side */}
              {about.imageUrl && (
                <div className="fade-in" style={{ position: 'relative' }}>
                  <div style={{
                    width: '100%', maxWidth: '380px', margin: '0 auto',
                    aspectRatio: '1', borderRadius: '50%', overflow: 'hidden',
                    border: '4px solid var(--gold)',
                    boxShadow: '0 0 60px rgba(212,175,55,0.2)',
                  }}>
                    <img src={about.imageUrl} alt={about.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {about.founded && (
                    <div style={{
                      position: 'absolute', bottom: '16px', right: '16px',
                      background: 'var(--gold)', color: 'var(--black)',
                      borderRadius: 'var(--radius)', padding: '10px 16px', fontWeight: 700, fontSize: '13px',
                    }}>Since {about.founded}</div>
                  )}
                </div>
              )}
              {/* Text side */}
              <div className="fade-in fade-in-delay-1">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '5px 16px', fontSize: '12px', color: 'var(--gold)', marginBottom: '20px' }}>
                  ℹ️ About Us
                </div>
                <h2 style={{ fontSize: 'clamp(28px,5vw,42px)', marginBottom: '12px', lineHeight: 1.2 }}>
                  {about.title || 'About Usha Photo Studio'}
                </h2>
                {about.tagline && <p style={{ color: 'var(--gold)', fontStyle: 'italic', fontSize: '16px', marginBottom: '16px' }}>"{about.tagline}"</p>}
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '15px', marginBottom: '24px' }}>
                  {about.description}
                </p>
                {about.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                    📍 {about.location}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link to="/calendar" className="btn btn-primary">📅 Book a Session</Link>
                  <Link to="/portfolio" className="btn btn-outline">🖼️ View Our Work</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ SERVICES (live from DB) ════════════════════════════════ */}
      <section style={{ background: 'var(--surface)', padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '5px 16px', fontSize: '12px', color: 'var(--gold)', marginBottom: '16px' }}>💰 Transparent Pricing</div>
            <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>Our Services</h2>
            <p style={{ color: 'var(--text-muted)' }}>Prices always live from our system</p>
          </div>
          {svcLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} style={{ height: '160px', background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', opacity: 0.5 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {services.map((s, i) => (
                <div key={s.id} className="card fade-in" style={{ textAlign: 'center', padding: '24px 16px', animationDelay: `${i * 0.06}s`, transition: 'all 0.25s ease', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,175,55,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
                  <h3 style={{ fontSize: '14px', marginBottom: '4px', lineHeight: 1.3 }}>{s.label}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '10px' }}>{s.desc}</p>
                  {s.priceTBD ? (
                    <div style={{ color: 'var(--warning)', fontWeight: 700 }}>Price TBD</div>
                  ) : (
                    <div>
                      <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700 }}>₹{s.price}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        per {s.unit}{s.copies > 1 && <span style={{ color: 'var(--success)', marginLeft: '4px' }}>· {s.copies} copies</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <Link to="/order" className="btn btn-primary">📤 Order Now →</Link>
          </div>
        </div>
      </section>

      {/* ══ PORTFOLIO MARQUEE ═════════════════════════════════════ */}
      {portfolio.length > 0 && (
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '5px 16px', fontSize: '12px', color: 'var(--gold)', marginBottom: '16px' }}>✨ Our Work</div>
            <h2 style={{ fontSize: '40px', marginBottom: '8px' }}>Work We've Done</h2>
            <p style={{ color: 'var(--text-muted)' }}>Hover to pause · <Link to="/portfolio" style={{ color: 'var(--gold)' }}>View all →</Link></p>
          </div>
          {/* Marquee strip */}
          <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
            {/* Left fade */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to right, var(--black), transparent)', zIndex: 2 }} />
            {/* Right fade */}
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to left, var(--black), transparent)', zIndex: 2 }} />
            <div className="marquee-track">
              {marqueeItems.map((item, i) => (
                <div key={`${item._id}-${i}`} style={{ flexShrink: 0, width: '220px', margin: '0 10px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)', transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                    <img src={item.imageUrl} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    {item.featured && <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--gold)', color: 'var(--black)', borderRadius: '100px', padding: '2px 8px', fontSize: '10px', fontWeight: 700 }}>⭐</div>}
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: '100px', padding: '2px 8px', fontSize: '10px', textTransform: 'capitalize', backdropFilter: 'blur(4px)' }}>{item.category}</div>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/portfolio" className="btn btn-outline">View All Work →</Link>
          </div>
        </section>
      )}

      {/* ══ HOW IT WORKS ══════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>How It Works</h2>
            <p style={{ color: 'var(--text-muted)' }}>4 simple steps — no queues, no cash needed</p>
          </div>
          <div className="grid-4">
            {steps.map((step, i) => (
              <div key={step.num} style={{ position: 'relative' }}>
                {i < steps.length - 1 && <div style={{ position: 'absolute', top: '27px', left: 'calc(50% + 32px)', width: 'calc(100% - 64px)', height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />}
                <div style={{ textAlign: 'center', padding: '20px 14px' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 700, fontSize: '16px' }}>{step.num}</div>
                  <h3 style={{ fontSize: '15px', marginBottom: '6px' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOOK A SESSION CTA ════════════════════════════════════ */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)', background: 'rgba(212,175,55,0.03)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '12px' }}>📅 Planning an Event?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
            Weddings, baby showers, house warmings — book us for your special day!
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/calendar" className="btn btn-primary btn-lg">📅 Check Availability & Book</Link>
            <Link to="/about" className="btn btn-outline btn-lg">ℹ️ About Us</Link>
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.02) 100%)', borderTop: '1px solid var(--border)', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', marginBottom: '14px' }}>Ready to Order?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '17px', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>No queues. No cash. Scan, order, done.</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/order" className="btn btn-primary btn-lg">📸 Start Your Order</Link>
            <Link to="/portfolio" className="btn btn-outline btn-lg">🖼️ Our Work</Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © {new Date().getFullYear()} {shopInfo.name} — Smart Photo Order Management
            {shopInfo.address && <span style={{ marginLeft: '12px' }}>📍 {shopInfo.address}</span>}
          </p>
        </div>
      </footer>
    </div>
  );
}