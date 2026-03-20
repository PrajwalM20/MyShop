import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function QRPosterPage() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [ownerQR,  setOwnerQR]  = useState(null);
  const [clientQR, setClientQR] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [services, setServices] = useState([]);
  const [shopName, setShopName] = useState('');
  const [tagline,  setTagline]  = useState('Scan to place your order online. No waiting!');
  const [phone,    setPhone]    = useState('');
  const [activeQR, setActiveQR] = useState('client'); // 'client' | 'owner'

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [ownerRes, clientRes, shopRes, svcRes] = await Promise.all([
        api.get('/qr/generate'),
        api.get('/qr/client'),
        api.get('/settings/shop-info'),
        api.get('/orders/services'),
      ]);
      setOwnerQR(ownerRes.data.qrCode);
      setClientQR(clientRes.data.qrCode);
      setShopName(shopRes.data.name || 'Usha Photo Studio');
      setPhone(shopRes.data.phone || '');
      setServices(svcRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handlePrint = () => window.print();

  const downloadQR = (type) => {
    const src = type === 'client' ? clientQR : ownerQR;
    if (!src) return;
    const a   = document.createElement('a');
    a.href    = src;
    a.download = type === 'client'
      ? `${shopName.replace(/\s+/g,'-')}-client-qr.png`
      : `${shopName.replace(/\s+/g,'-')}-owner-qr.png`;
    a.click();
    toast.success('QR downloaded!');
  };

  const currentQR = activeQR === 'client' ? clientQR : ownerQR;

  const steps = [
    ['📤', 'Upload Photos', 'Share photos instantly'],
    ['💳', 'Pay via UPI',   'GPay, PhonePe, Paytm'],
    ['🔢', 'Get Queue No.', 'Skip the line'],
    ['📱', 'Get Notified',  'WhatsApp when ready'],
  ];

  return (
    <>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden; }
          .poster-wrap, .poster-wrap * { visibility: visible; }
          .poster-wrap { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="page">
        <div className="container" style={{ maxWidth: '860px' }}>

          {/* Controls */}
          <div className="no-print fade-in" style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🖨️ QR <span className="text-gold">Posters</span></h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '15px' }}>
              Two separate QR codes — one for clients, one for full access.
            </p>

            {/* QR Type Selector */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[
                { id: 'client', label: '👥 Client QR', sub: 'Opens client dashboard — order, track, book, feedback', color: 'var(--success)' },
                { id: 'owner',  label: '🔑 Owner QR',  sub: 'Opens Owner page — full site access',                  color: 'var(--gold)'    },
              ].map(opt => (
                <div key={opt.id} onClick={() => setActiveQR(opt.id)} style={{
                  flex: '1 1 220px', padding: '16px 18px', borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${activeQR === opt.id ? opt.color : 'var(--border)'}`,
                  background: activeQR === opt.id ? `${opt.color}10` : 'var(--surface)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: activeQR === opt.id ? opt.color : 'var(--text)', marginBottom: '4px' }}>{opt.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{opt.sub}</div>
                </div>
              ))}
            </div>

            {/* Customise */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '14px', fontSize: '15px' }}>✏️ Customise Poster</h3>
              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="input-group">
                  <label>Shop Name</label>
                  <input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="Usha Photo Studio" />
                </div>
                <div className="input-group">
                  <label>Tagline</label>
                  <input value={tagline} onChange={e => setTagline(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="9353588862" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={handlePrint} className="btn btn-primary">🖨️ Print Poster</button>
              <button onClick={() => downloadQR(activeQR)} className="btn btn-outline" disabled={!currentQR}>
                ⬇️ Download {activeQR === 'client' ? 'Client' : 'Owner'} QR
              </button>
              <button onClick={loadAll} className="btn btn-outline">🔄 Refresh</button>
            </div>
          </div>

          {/* ── POSTER ──────────────────────────────────────── */}
          <div className="poster-wrap">
            <div style={{
              background: '#ffffff', borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)', width: '100%',
              maxWidth: '500px', margin: '0 auto', border: '2px solid #e8e0cc',
            }}>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)', padding: '32px 32px 24px', textAlign: 'center' }}>
                <div style={{ color: '#D4AF37', fontSize: '11px', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  {activeQR === 'client' ? '📸 Professional Photo Studio' : '🔑 Owner / Staff Access'}
                </div>
                <div style={{ color: '#ffffff', fontSize: '32px', fontWeight: 900, lineHeight: 1.15, fontFamily: "'Playfair Display', serif" }}>
                  {shopName}
                </div>
                {phone && <div style={{ color: '#D4AF37', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', marginTop: '8px', fontWeight: 600 }}>📞 {phone}</div>}
                {activeQR === 'client' && (
                  <div style={{ marginTop: '10px', background: 'rgba(45,216,130,0.2)', borderRadius: '100px', padding: '4px 14px', display: 'inline-block', fontSize: '12px', color: '#2DD882', fontWeight: 700 }}>
                    👥 CLIENT ACCESS
                  </div>
                )}
              </div>

              {/* Gold bar */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #b8942a, #D4AF37, #f0cc60, #D4AF37, #b8942a)' }} />

              {/* QR + Content */}
              <div style={{ background: '#fafaf8', padding: '32px 32px 24px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', padding: '12px', background: '#ffffff', borderRadius: '16px', border: '3px solid #1a1a2e', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginBottom: '18px' }}>
                  {loading ? (
                    <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                      <div style={{ fontSize: '28px' }}>⏳</div>
                    </div>
                  ) : currentQR ? (
                    <img src={currentQR} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                  ) : null}
                </div>

                <div style={{ color: '#1a1a2e', fontSize: '19px', fontWeight: 800, marginBottom: '6px', fontFamily: "'Playfair Display', serif" }}>
                  {activeQR === 'client' ? '📱 Scan to Order & Book' : '📱 Scan for Full Access'}
                </div>
                <div style={{ color: '#666', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, marginBottom: '20px' }}>
                  {activeQR === 'client' ? tagline : 'Opens full ordering and management site'}
                </div>

                {/* Steps — only for client QR */}
                {activeQR === 'client' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    {steps.map(([icon, title, desc]) => (
                      <div key={title} style={{ background: '#ffffff', borderRadius: '10px', padding: '12px 8px', textAlign: 'center', border: '1px solid #e8e0cc' }}>
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
                        <div style={{ color: '#1a1a2e', fontSize: '12px', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{title}</div>
                        <div style={{ color: '#999', fontSize: '10px', fontFamily: 'DM Sans, sans-serif' }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Services */}
                <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '16px 18px', textAlign: 'left' }}>
                  <div style={{ color: '#D4AF37', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
                    {activeQR === 'client' ? 'Our Services & Prices' : 'Available Services'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {services.map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ color: '#cccccc', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>{s.icon} {s.label}</span>
                        <span style={{ color: '#D4AF37', fontSize: '12px', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>
                          {s.priceTBD ? 'TBD' : `₹${s.price}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: 'linear-gradient(90deg, #b8942a, #D4AF37, #f0cc60, #D4AF37, #b8942a)', padding: '12px 32px', textAlign: 'center' }}>
                <div style={{ color: '#1a1a2e', fontSize: '11px', fontWeight: 800, fontFamily: 'DM Sans, sans-serif', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {shopName} · {activeQR === 'client' ? 'Customer Portal' : 'Digital Order System'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}