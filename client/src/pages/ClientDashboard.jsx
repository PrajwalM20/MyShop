import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ClientDashboard() {
  const [shopInfo,  setShopInfo]  = useState({ name: 'Usha Photo Studio' });
  const [about,     setAbout]     = useState(null);
  const [qrCode,    setQrCode]    = useState(null);
  const [trackId,   setTrackId]   = useState('');

  useEffect(() => {
    api.get('/settings/shop-info').then(({ data }) => setShopInfo(data)).catch(() => {});
    api.get('/about').then(({ data }) => setAbout(data)).catch(() => {});
    // Load client QR (points to /order)
    api.get('/qr/client').then(({ data }) => setQrCode(data.qrCode)).catch(() => {});
  }, []);

  const CLIENT_MENU = [
    { icon: '📤', label: 'Place Order',       sub: 'Upload photos & pay via UPI',        to: '/order',     color: 'var(--gold)',    bg: 'rgba(212,175,55,0.1)'  },
    { icon: '🔍', label: 'Track Order',        sub: 'Check your order status',            to: '/track',     color: 'var(--info)',    bg: 'rgba(75,158,255,0.1)'  },
    { icon: '📅', label: 'Book a Session',     sub: 'Weddings, events & more',            to: '/calendar',  color: '#9b59b6',        bg: 'rgba(155,89,182,0.1)'  },
    { icon: '🖼️', label: 'Our Work',           sub: 'Browse our portfolio',               to: '/portfolio', color: 'var(--success)', bg: 'rgba(45,216,130,0.1)'  },
    { icon: 'ℹ️',  label: 'About Us',           sub: 'Meet our team & studio',             to: '/about',     color: 'var(--warning)', bg: 'rgba(255,179,71,0.1)'  },
    { icon: '⭐', label: 'Give Feedback',      sub: 'Rate your experience',               to: '/feedback',  color: '#e74c3c',        bg: 'rgba(231,76,60,0.1)'   },
  ];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '700px' }}>

        {/* Header */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '32px', padding: '0 8px' }}>
          {about?.logoUrl && (
            <img src={about.logoUrl} alt="Logo"
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold)', marginBottom: '16px', boxShadow: '0 0 32px rgba(212,175,55,0.2)' }}
            />
          )}
          <h1 style={{ fontSize: 'clamp(22px,5vw,34px)', marginBottom: '6px' }}>
            Welcome to <span className="text-gold">{shopInfo.name}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            What would you like to do today?
          </p>
          {shopInfo.hours && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
              🕐 {shopInfo.hours}
              {shopInfo.phone && <span style={{ marginLeft: '14px' }}>📞 {shopInfo.phone}</span>}
            </div>
          )}
        </div>

        {/* Quick Track */}
        <div className="card fade-in" style={{ marginBottom: '20px', padding: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Quick Order Track
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={trackId}
              onChange={e => setTrackId(e.target.value)}
              placeholder="Enter Order ID  e.g. CQ-XXXXXXXX"
              style={{ flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && trackId && (window.location.href = `/track/${trackId}`)}
            />
            <Link
              to={trackId ? `/track/${trackId}` : '/track'}
              className="btn btn-primary btn-sm"
              style={{ flexShrink: 0 }}
            >
              🔍 Track
            </Link>
          </div>
        </div>

        {/* Main Menu Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {CLIENT_MENU.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              className="fade-in"
              style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
                padding: '20px 16px', borderRadius: 'var(--radius-lg)',
                border: `1px solid ${item.color}33`,
                background: item.bg, textDecoration: 'none',
                transition: 'all 0.2s', animationDelay: `${i * 0.06}s`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${item.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '32px', lineHeight: 1 }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: item.color, marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Client QR Code */}
        {qrCode && (
          <div className="card fade-in" style={{ textAlign: 'center', border: '1px solid rgba(212,175,55,0.2)', padding: '24px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              📱 Share With Friends
            </div>
            <div style={{ display: 'inline-block', padding: '12px', background: '#fff', borderRadius: '12px', marginBottom: '12px' }}>
              <img src={qrCode} alt="Client QR" style={{ width: '140px', height: '140px', display: 'block' }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '0' }}>
              Scan to open Usha Photo Studio ordering page
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © {new Date().getFullYear()} {shopInfo.name}
            {shopInfo.address && <span style={{ marginLeft: '10px' }}>📍 {shopInfo.address}</span>}
          </p>
        </div>

      </div>
    </div>
  );
}