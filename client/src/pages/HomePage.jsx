import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const steps = [
  { num: '01', title: 'Scan & Open',   desc: 'Scan QR code outside the shop' },
  { num: '02', title: 'Upload Photos', desc: 'Upload all photos from your phone' },
  { num: '03', title: 'Pick Services', desc: 'Passport, prints, lamination & more' },
  { num: '04', title: 'Pay & Relax',   desc: 'Pay via UPI · WhatsApp alert when ready' },
];

const MARQUEE_CSS = `
@keyframes marquee-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  display: flex;
  animation: marquee-scroll 28s linear infinite;
  width: max-content;
}
.marquee-track:hover { animation-play-state: paused; }
.portfolio-card { transition: all 0.25s ease; }
.portfolio-card:hover { border-color: var(--gold) !important; transform: scale(1.03); }
`;

export default function HomePage() {
  const [services,    setServices]    = useState([]);
  const [portfolio,   setPortfolio]   = useState([]);
  const [shopInfo,    setShopInfo]    = useState({ name: 'Usha Photo Studio' });
  const [about,       setAbout]       = useState(null);
  const [svcLoading,  setSvcLoading]  = useState(true);

  useEffect(() => {
    api.get('/settings/services')
      .then(({ data }) => { setServices(data); setSvcLoading(false); })
      .catch(() => setSvcLoading(false));
    api.get('/portfolio?category=all')
      .then(({ data }) => setPortfolio(data))
      .catch(() => {});
    api.get('/settings/shop-info')
      .then(({ data }) => setShopInfo(data))
      .catch(() => {});
    api.get('/about')
      .then(({ data }) => setAbout(data))
      .catch(() => {});
  }, []);

  const marqueeItems = [...portfolio, ...portfolio];

  // Separate photo services and event services
  const photoServices = services.filter(s => s.category === 'photo' || (!s.category && !s.bookingRequired));
  const eventServices = services.filter(s => s.bookingRequired || s.category === 'event');

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

          {/* Dynamic logo from DB */}
          {about?.logoUrl && (
            <div className="fade-in" style={{ marginBottom: '28px' }}>
              <img src={about.logoUrl} alt="Usha Studio"
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold)', boxShadow: '0 0 40px rgba(212,175,55,0.3)' }}
              />
            </div>
          )}

          <div className="fade-in" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '6px 18px', fontSize: '14px', color: 'var(--gold)', marginBottom: '28px' }}>
            📸 Smart Photo Studio · Order Online
          </div>

          <h1 className="fade-in fade-in-delay-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 8vw, 80px)', lineHeight: 1.1, marginBottom: '24px', fontWeight: 900 }}>
            Skip the Queue.<br />
            <span style={{ color: 'var(--gold)' }}>Not the Photos.</span>
          </h1>

          <p className="fade-in fade-in-delay-2" style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 48px', lineHeight: 1.8 }}>
            Passport photos, prints, lamination &amp; more — order online, pay via UPI, get WhatsApp notification when ready.
          </p>

          <div className="fade-in fade-in-delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/order"    className="btn btn-primary btn-lg">📤 Place Your Order</Link>
            <Link to="/track"    className="btn btn-outline btn-lg">🔍 Track Order</Link>
          </div>

          {(shopInfo.phone || shopInfo.hours || shopInfo.address) && (
            <div className="fade-in" style={{ marginTop: '28px', color: 'var(--text-muted)', fontSize: '15px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {shopInfo.phone   && <span>📞 {shopInfo.phone}</span>}
              {shopInfo.hours   && <span>🕐 {shopInfo.hours}</span>}
              {shopInfo.address && <span>📍 {shopInfo.address}</span>}
            </div>
          )}

          <div className="fade-in" style={{ display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '60px', flexWrap: 'wrap' }}>
            {[['No Waiting','Skip queues completely'],['UPI Payment','GPay, PhonePe, Paytm'],['Instant Alert','WhatsApp + SMS']].map(([t,s]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)', fontWeight: 700 }}>{t}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT US ══════════════════════════════════════════════ */}
      {about && (about.description || about.imageUrl || about.ownerName) && (
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
          <div className="container">

            {/* Studio section — owner name/role inline, no separate card */}
            {(about.description || about.imageUrl) && (
              <div style={{ display: 'grid', gridTemplateColumns: about.imageUrl ? '1fr 1fr' : '1fr', gap: '48px', alignItems: 'center' }}>

                {about.imageUrl && (
                  <div className="fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '360px', aspectRatio: '1', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--gold)', boxShadow: '0 0 60px rgba(212,175,55,0.2)' }}>
                      <img src={about.imageUrl} alt={about.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </div>
                )}

                <div className="fade-in fade-in-delay-1">
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '5px 16px', fontSize: '13px', color: 'var(--gold)', marginBottom: '20px' }}>
                    ℹ️ About Us
                  </div>
                  <h2 style={{ fontSize: 'clamp(28px,5vw,42px)', marginBottom: '12px', lineHeight: 1.2 }}>
                    {about.title || 'About Usha Photo Studio'}
                  </h2>
                  {about.tagline && <p style={{ color: 'var(--gold)', fontStyle: 'italic', fontSize: '17px', marginBottom: '16px' }}>"{about.tagline}"</p>}
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, fontSize: '16px', marginBottom: '20px' }}>{about.description}</p>

                  {/* Founder name + role — text only under description, no photo */}
                  {about.ownerName && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '2px' }}>{about.ownerName}</div>
                      {about.ownerRole && <div style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 600 }}>{about.ownerRole}</div>}
                    </div>
                  )}

                  {about.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
                      📍 {about.location}
                      {about.founded && <span style={{ marginLeft: '16px' }}>🗓 Est. {about.founded}</span>}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Link to="/calendar" className="btn btn-primary">📅 Book a Session</Link>
                    <Link to="/about"    className="btn btn-outline">Read More →</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══ PHOTO SERVICES ════════════════════════════════════════ */}
      <section style={{ background: 'var(--surface)', padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '5px 16px', fontSize: '13px', color: 'var(--gold)', marginBottom: '16px' }}>
              💰 Transparent Pricing
            </div>
            <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>Photo Services</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Prices are always live from our system</p>
          </div>

          {svcLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '16px' }}>
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} style={{ height: '160px', background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', opacity: 0.5 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '16px' }}>
              {(photoServices.length > 0 ? photoServices : services.filter(s => !s.bookingRequired)).map((s, i) => (
                <div key={s.id} className="card fade-in" style={{ textAlign: 'center', padding: '24px 16px', border: '1px solid var(--border)', animationDelay: `${i * 0.06}s`, transition: 'all 0.25s ease', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--gold)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(212,175,55,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
                  <h3 style={{ fontSize: '14px', marginBottom: '4px', lineHeight: 1.3 }}>{s.label}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '10px' }}>{s.desc}</p>
                  {s.priceTBD ? (
                    <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '14px' }}>Price TBD</div>
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

      {/* ══ EVENT PHOTOGRAPHY ═════════════════════════════════════ */}
      {eventServices.length > 0 && (
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '5px 16px', fontSize: '13px', color: 'var(--gold)', marginBottom: '16px' }}>
                📅 Event Photography
              </div>
              <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>Book Us for Your Event</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Check calendar availability and book your special day</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '36px' }}>
              {eventServices.map((s, i) => (
                <div key={s.id} className="card fade-in" style={{ padding: '24px 20px', border: '1px solid var(--border)', animationDelay: `${i * 0.07}s`, transition: 'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--gold)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(212,175,55,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{s.icon}</div>
                  <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>{s.label}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>{s.desc}</p>
                  <Link to="/calendar" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}>
                    📅 Check Availability
                  </Link>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📅</div>
              <h3 style={{ fontSize: '22px', marginBottom: '8px' }}>Planning a Special Event?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '20px' }}>Check our calendar for available dates and book your session</p>
              <Link to="/calendar" className="btn btn-primary btn-lg">Check Calendar & Book →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ PORTFOLIO MARQUEE ═════════════════════════════════════ */}
      {portfolio.length > 0 && (
        <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)', overflow: 'hidden', background: 'var(--surface)' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '5px 16px', fontSize: '13px', color: 'var(--gold)', marginBottom: '14px' }}>✨ Our Work</div>
            <h2 style={{ fontSize: '40px', marginBottom: '8px' }}>Work We've Done</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Hover to pause · <Link to="/portfolio" style={{ color: 'var(--gold)' }}>View all →</Link></p>
          </div>
          <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to right, var(--surface), transparent)', zIndex: 2 }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to left, var(--surface), transparent)', zIndex: 2 }} />
            <div className="marquee-track">
              {marqueeItems.map((item, i) => (
                <div key={`${item._id}-${i}`} className="portfolio-card" style={{ flexShrink: 0, width: '220px', margin: '0 10px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--black)' }}>
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
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>How It Works</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>4 simple steps — no queues, no cash needed</p>
          </div>
          <div className="grid-4">
            {steps.map((step, i) => (
              <div key={step.num} style={{ position: 'relative' }}>
                {i < steps.length - 1 && <div style={{ position: 'absolute', top: '27px', left: 'calc(50% + 32px)', width: 'calc(100% - 64px)', height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />}
                <div style={{ textAlign: 'center', padding: '20px 14px' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 700, fontSize: '16px' }}>{step.num}</div>
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.07), rgba(212,175,55,0.02))', borderTop: '1px solid var(--border)', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(28px,5vw,48px)', marginBottom: '14px' }}>Ready to Order?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '17px', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>
            No queues. No cash. Scan &amp; order from your phone.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/order"    className="btn btn-primary btn-lg">📸 Start Your Order</Link>
            <Link to="/calendar" className="btn btn-outline btn-lg">📅 Book an Event</Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            © {new Date().getFullYear()} {shopInfo.name} — Smart Photo Order Management
            {shopInfo.address && <span style={{ marginLeft: '12px' }}>📍 {shopInfo.address}</span>}
          </p>
          <div style={{ marginTop: '10px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/about"     style={{ color: 'var(--text-muted)', fontSize: '13px' }}>About Us</Link>
            <Link to="/portfolio" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Our Work</Link>
            <Link to="/calendar"  style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Book a Session</Link>
            <Link to="/track"     style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Track Order</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}