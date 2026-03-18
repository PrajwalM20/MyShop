import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/about').then(({ data }) => { setAbout(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: '48px', height: '48px' }} />
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>

        {/* Header */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '100px', padding: '6px 18px', fontSize: '13px', color: 'var(--gold)', marginBottom: '20px' }}>
            ℹ️ About Us
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', marginBottom: '12px' }}>
            {about?.title || 'About <span class="text-gold">Usha Photo Studio</span>'}
          </h1>
          {about?.tagline && <p style={{ color: 'var(--gold)', fontStyle: 'italic', fontSize: '18px' }}>"{about.tagline}"</p>}
        </div>

        {/* Main content */}
        <div style={{ display: 'grid', gridTemplateColumns: about?.imageUrl ? '1fr 1fr' : '1fr', gap: '56px', alignItems: 'center', marginBottom: '64px' }}>
          {about?.imageUrl && (
            <div className="fade-in" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%', maxWidth: '360px', aspectRatio: '1',
                borderRadius: '50%', overflow: 'hidden',
                border: '4px solid var(--gold)',
                boxShadow: '0 0 80px rgba(212,175,55,0.2)',
                position: 'relative',
              }}>
                <img src={about.imageUrl} alt={about.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}
          <div className="fade-in fade-in-delay-1">
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.9, fontSize: '16px', marginBottom: '32px' }}>
              {about?.description || 'We are a professional photo studio providing high-quality photo services.'}
            </p>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {about?.founded && (
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', minWidth: '100px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--gold)', fontWeight: 700 }}>{about.founded}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Year Founded</div>
                </div>
              )}
              {about?.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '15px' }}>
                  <span style={{ fontSize: '28px' }}>📍</span>
                  <span>{about.location}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/calendar" className="btn btn-primary">📅 Book a Session</Link>
              <Link to="/order" className="btn btn-outline">📤 Place an Order</Link>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="fade-in">
          <h2 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '32px' }}>Why Choose Us?</h2>
          <div className="grid-3" style={{ gap: '20px' }}>
            {[
              { icon: '📸', title: 'Professional Quality', desc: 'Every photo printed and processed with care and precision' },
              { icon: '⚡', title: 'Fast Turnaround', desc: 'Get notified on WhatsApp the moment your order is ready' },
              { icon: '💳', title: 'Easy Payments', desc: 'Pay via GPay, PhonePe, Paytm or any UPI app — no cash needed' },
              { icon: '📅', title: 'Event Bookings', desc: 'Book us for weddings, ceremonies, and special occasions' },
              { icon: '💰', title: 'Honest Prices', desc: 'Transparent pricing with no hidden charges, always' },
              { icon: '🏆', title: 'Trusted Local Studio', desc: `Serving ${about?.location || 'our community'} since ${about?.founded || 'years'}` },
            ].map(v => (
              <div key={v.title} className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{v.icon}</div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{v.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}