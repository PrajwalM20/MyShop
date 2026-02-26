import { useParams, useSearchParams, Link } from 'react-router-dom';

export default function ConfirmationPage() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const queueNumber = params.get('queue');
  const amount = params.get('amount');

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '560px', textAlign: 'center' }}>

        <div className="fade-in" style={{ marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(45,216,130,0.1)', border: '2px solid var(--success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', margin: '0 auto 24px',
            animation: 'pulse 2s ease infinite',
          }}>✅</div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            We've sent confirmation to your WhatsApp, SMS & Email
          </p>
        </div>

        <div className="card fade-in fade-in-delay-1" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Order ID</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)', fontWeight: 700 }}>{orderId}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Queue Number</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', color: 'var(--gold)', fontWeight: 900, lineHeight: 1 }}>#{queueNumber}</div>
            </div>
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Amount Paid</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--success)', fontWeight: 700 }}>₹{amount}</span>
          </div>
        </div>

        <div className="card fade-in fade-in-delay-2" style={{ marginBottom: '32px', textAlign: 'left' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>What happens next?</h3>
          {[
            ['📋', 'Order received', 'Shop owner has been notified instantly'],
            ['🖨️', 'Processing starts', 'Your photos will be printed shortly'],
            ['📱', 'You get notified', 'WhatsApp + SMS + Email when ready'],
            ['🏪', 'Pickup', 'Visit the shop and show your Order ID'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/track/${orderId}`} className="btn btn-primary">🔍 Track My Order</Link>
          <Link to="/" className="btn btn-outline">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
