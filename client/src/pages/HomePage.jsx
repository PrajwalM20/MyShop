import { Link } from 'react-router-dom';

const services = [
  { icon: '🪪', name: 'Passport Photo', desc: 'Govt-approved size with white background', price: '₹40' },
  { icon: '🖼️', name: 'Photo Print 4×6', desc: 'High-quality glossy/matte finish', price: '₹15' },
  { icon: '📄', name: 'Photo Print A4', desc: 'Full-size premium photo print', price: '₹30' },
  { icon: '✨', name: 'Lamination', desc: 'Protect your precious photos', price: '₹50' },
  { icon: '🎓', name: 'School ID Photo', desc: 'Perfect ID card photos for students', price: '₹60' },
];

const steps = [
  { num: '01', title: 'Scan & Open', desc: 'Scan the QR code outside the shop to open our ordering page' },
  { num: '02', title: 'Upload Photos', desc: 'Drag & drop your photos and select the service you need' },
  { num: '03', title: 'Pay Online', desc: 'Pay instantly via UPI, GPay, or PhonePe — no cash needed' },
  { num: '04', title: 'Get Notified', desc: 'Receive WhatsApp/SMS/Email when your order is ready for pickup' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(212,175,55,0.08) 0%, transparent 70%)',
      }}>
        {/* Decorative grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.3,
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '100px 24px 60px' }}>
          <div className="fade-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '100px', padding: '6px 16px', fontSize: '13px',
            color: 'var(--gold)', marginBottom: '32px'
          }}>
            📸 Smart Photo Studio Queue System
          </div>

          <h1 className="fade-in fade-in-delay-1" style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 8vw, 80px)',
            lineHeight: 1.1, marginBottom: '24px', fontWeight: 900,
          }}>
            Skip the Queue.<br />
            <span style={{ color: 'var(--gold)' }}>Not the Photos.</span>
          </h1>

          <p className="fade-in fade-in-delay-2" style={{
            fontSize: '18px', color: 'var(--text-muted)', maxWidth: '500px',
            margin: '0 auto 48px', lineHeight: 1.7,
          }}>
            Order passport photos, prints & more online. Pay via UPI. 
            Get WhatsApp notification when ready. Zero waiting in line.
          </p>

          <div className="fade-in fade-in-delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/order" className="btn btn-primary btn-lg">
              📤 Place Your Order
            </Link>
            <Link to="/track" className="btn btn-outline btn-lg">
              🔍 Track Order
            </Link>
          </div>

          {/* Stats bar */}
          <div className="fade-in" style={{
            display: 'flex', gap: '48px', justifyContent: 'center', marginTop: '80px',
            flexWrap: 'wrap',
          }}>
            {[['No Waiting', 'Skip queues completely'], ['UPI Payment', 'GPay, PhonePe, Paytm'], ['Instant Alert', 'WhatsApp + SMS']].map(([title, sub]) => (
              <div key={title} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)', fontWeight: 700 }}>{title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{ background: 'var(--surface)', padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>Our Services</h2>
            <p style={{ color: 'var(--text-muted)' }}>Professional photo services at affordable prices</p>
          </div>
          <div className="grid-3" style={{ gap: '20px' }}>
            {services.map((s) => (
              <div key={s.name} className="card card-hover" style={{ cursor: 'pointer', textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{s.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>{s.desc}</p>
                <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700 }}>{s.price}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per piece</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '40px', marginBottom: '12px' }}>How It Works</h2>
            <p style={{ color: 'var(--text-muted)' }}>4 simple steps to get your photos without waiting</p>
          </div>
          <div className="grid-4">
            {steps.map((step, i) => (
              <div key={step.num} style={{ position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '28px', left: 'calc(50% + 32px)',
                    width: 'calc(100% - 64px)', height: '1px',
                    background: 'linear-gradient(90deg, var(--gold), transparent)',
                    display: window.innerWidth > 768 ? 'block' : 'none',
                  }} />
                )}
                <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 700,
                  }}>
                    {step.num}
                  </div>
                  <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)',
        borderTop: '1px solid var(--border)',
        padding: '80px 0', textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ fontSize: '48px', marginBottom: '16px' }}>Ready to Order?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '40px' }}>
            Get your photos done the smart way. No queues. No cash. Just click.
          </p>
          <Link to="/order" className="btn btn-primary btn-lg">📸 Start Your Order Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © {new Date().getFullYear()} ClickQueue — Smart Photo Order Management System
          </p>
        </div>
      </footer>
    </div>
  );
}
