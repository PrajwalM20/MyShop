import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const steps = [
  { num: '01', title: 'Scan & Open',   desc: 'Scan the QR code outside the shop to open our ordering page' },
  { num: '02', title: 'Upload Photos', desc: 'Upload all your photos at once from your phone or computer' },
  { num: '03', title: 'Pick Services', desc: 'Choose passport, prints, lamination — even multiple at once!' },
  { num: '04', title: 'Pay & Relax',   desc: 'Pay via GPay/UPI & get WhatsApp alert when photos are ready' },
];

export default function HomePage() {
  const [services, setServices]     = useState([]);
  const [portfolio, setPortfolio]   = useState([]);
  const [shopInfo, setShopInfo]     = useState({ name: 'Usha Photo Studio' });
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    // Always fetch from /settings/services — this has the full catalogue with all new services
    api.get('/settings/services')
      .then(({ data }) => { setServices(data); setServicesLoading(false); })
      .catch(() => setServicesLoading(false));

    api.get('/portfolio?category=all')
      .then(({ data }) => setPortfolio(data.slice(0, 6)))
      .catch(() => {});

    api.get('/settings/shop-info')
      .then(({ data }) => setShopInfo(data))
      .catch(() => {});
  }, []);

  return (
    <div>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(212,175,55,0.08) 0%, transparent 70%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px', opacity: 0.3,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '100px 20px 60px' }}>

          <div className="fade-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '100px', padding: '6px 18px', fontSize: '13px', color: 'var(--gold)', marginBottom: '32px',
          }}>📸 Smart Photo Studio · Order Online</div>

          <h1 className="fade-in fade-in-delay-1" style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 8vw, 80px)',
            lineHeight: 1.1, marginBottom: '24px', fontWeight: 900,
          }}>
            Skip the Queue.<br />
            <span style={{ color: 'var(--gold)' }}>Not the Photos.</span>
          </h1>

          <p className="fade-in fade-in-delay-2" style={{
            fontSize: '18px', color: 'var(--text-muted)', maxWidth: '520px',
            margin: '0 auto 48px', lineHeight: 1.7,
          }}>
            Passport photos, prints, lamination &amp; more — order online, pay via UPI,
            get WhatsApp notification when ready. Zero waiting in line.
          </p>

          <div className="fade-in fade-in-delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/order" className="btn btn-primary btn-lg">📤 Place Your Order</Link>
            <Link to="/track" className="btn btn-outline btn-lg">🔍 Track Order</Link>
          </div>

          {/* Shop phone & hours from DB */}
          {(shopInfo.phone || shopInfo.hours) && (
            <div className="fade-in" style={{ marginTop: '28px', color: 'var(--text-muted)', fontSize: '14px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {shopInfo.phone && <span>📞 {shopInfo.phone}</span>}
              {shopInfo.hours && <span>🕐 {shopInfo.hours}</span>}
              {shopInfo.address && <span>📍 {shopInfo.address}</span>}
            </div>
          )}

          <div className="fade-in" style={{ display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '64px', flexWrap: 'wrap' }}>
            {[
              ['No Waiting',   'Skip queues completely'],
              ['UPI Payment',  'GPay, PhonePe, Paytm'],
              ['Instant Alert','WhatsApp + SMS'],
            ].map(([title, sub]) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)', fontWeight: 700 }}>{title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SERVICES (live from MongoDB) ══════════════════════════════ */}
      <section style={{ background: 'var(--surface)', padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">

          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '100px', padding: '5px 16px', fontSize: '12px', color: 'var(--gold)', marginBottom: '16px',
            }}>💰 Transparent Pricing</div>
            <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>Our Services</h2>
            <p style={{ color: 'var(--text-muted)' }}>All prices live from our system — always up to date</p>
          </div>

          {/* Loading skeletons */}
          {servicesLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} style={{ height: '160px', background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', opacity: 0.5 }} />
              ))}
            </div>
          )}

          {/* Service cards — all 8 services */}
          {!servicesLoading && services.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {services.map((s, i) => (
                <div key={s.id} className="card fade-in" style={{
                  textAlign: 'center', padding: '28px 20px', cursor: 'default',
                  border: '1px solid var(--border)', animationDelay: `${i * 0.06}s`,
                  transition: 'all 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,175,55,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>{s.icon}</div>
                  <h3 style={{ fontSize: '15px', marginBottom: '6px', lineHeight: 1.3 }}>{s.label}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '12px', lineHeight: 1.5 }}>{s.desc}</p>

                  {s.priceTBD ? (
                    <div>
                      <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '16px' }}>Price TBD</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Contact for quote</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700 }}>₹{s.price}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        per {s.unit}
                        {s.copies > 1 && <span style={{ color: 'var(--success)', marginLeft: '4px' }}>· {s.copies} copies</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/order" className="btn btn-primary">📤 Order Now →</Link>
          </div>
        </div>
      </section>

      {/* ══ PORTFOLIO (live from MongoDB) ═════════════════════════════ */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">

          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '100px', padding: '5px 16px', fontSize: '12px', color: 'var(--gold)', marginBottom: '16px',
            }}>✨ Our Work</div>
            <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>Work We've Done</h2>
            <p style={{ color: 'var(--text-muted)' }}>Browse our portfolio of professional photo services</p>
          </div>

          {portfolio.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>No portfolio items yet</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Owner: <strong style={{ color: 'var(--gold)' }}>Dashboard → Portfolio</strong> to add work here
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', marginBottom: '36px' }}>
                {portfolio.map((item, i) => (
                  <div key={item._id} className="fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
                    <div style={{
                      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                      border: '1px solid var(--border)', background: 'var(--surface)', transition: 'all 0.25s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(212,175,55,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden', background: 'var(--surface2)' }}>
                        <img src={item.imageUrl} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        {item.featured && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--gold)', color: 'var(--black)', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>⭐ Featured</div>
                        )}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: '100px', padding: '3px 10px', fontSize: '11px', textTransform: 'capitalize', backdropFilter: 'blur(4px)' }}>{item.category}</div>
                      </div>
                      <div style={{ padding: '14px' }}>
                        <h3 style={{ fontSize: '15px', marginBottom: '2px' }}>{item.title}</h3>
                        {item.description && <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <Link to="/portfolio" className="btn btn-outline">View All Work →</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>How It Works</h2>
            <p style={{ color: 'var(--text-muted)' }}>4 simple steps — no waiting, no cash needed</p>
          </div>
          <div className="grid-4">
            {steps.map((step, i) => (
              <div key={step.num} style={{ position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: '27px', left: 'calc(50% + 32px)', width: 'calc(100% - 64px)', height: '1px', background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
                )}
                <div style={{ textAlign: 'center', padding: '20px 14px' }}>
                  <div style={{
                    width: '54px', height: '54px', borderRadius: '50%',
                    background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px', fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 700, fontSize: '16px',
                  }}>{step.num}</div>
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.02) 100%)', borderTop: '1px solid var(--border)', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: '14px' }}>Ready to Order?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '17px', marginBottom: '40px', maxWidth: '480px', margin: '0 auto 40px' }}>
            Get your photos done the smart way. No queues. No cash. Just scan & order.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/order" className="btn btn-primary btn-lg">📸 Start Your Order Now</Link>
            <Link to="/portfolio" className="btn btn-outline btn-lg">🖼️ View Our Work</Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
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