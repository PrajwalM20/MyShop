import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function QRPosterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState(null);
  const [shopName, setShopName] = useState('Usha Photo Studio');
  const [tagline, setTagline] = useState('Scan to place your order online. No waiting!');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    generateQR();
  }, []);

  const generateQR = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/qr/generate');
      setQrCode(data.qrCode);
      if (data.shopName && data.shopName !== 'ClickQueue Photo Studio') {
        setShopName(data.shopName);
      }
    } catch (err) {
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = shopName.replace(/\s+/g, '-') + '-qr.png';
    link.click();
    toast.success('QR downloaded!');
  };

  const services = [
    ['🪪', 'Passport Photo', '₹50'],
    ['🖼️', 'Print 4x6', '₹50'],
    ['📄', 'Print A4', '₹30'],
    ['✨', 'Lamination', '₹150'],
    ['🎓', 'School ID Photo', '₹50'],
  ];

  const steps = [
    ['📤', 'Upload Photos', 'Share photos instantly'],
    ['💳', 'Pay via UPI', 'GPay, PhonePe, Paytm'],
    ['🔢', 'Get Queue No.', 'Skip the line'],
    ['📱', 'Get Notified', 'WhatsApp when ready'],
  ];

  return (
    <>
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden; }
          .poster-wrap, .poster-wrap * { visibility: visible; }
          .poster-wrap { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="page">
        <div className="container" style={{ maxWidth: '860px' }}>

          {/* Controls */}
          <div className="no-print fade-in" style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
              🖨️ Shop <span className="text-gold">QR Poster</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Customize and print this poster to paste outside your shop
            </p>

            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>✏️ Customize Poster</h3>
              <div className="grid-2" style={{ gap: '16px' }}>
                <div className="input-group">
                  <label>Shop Name</label>
                  <input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="e.g. Usha Photo Studio" />
                </div>
                <div className="input-group">
                  <label>Tagline</label>
                  <input value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Short tagline..." />
                </div>
                <div className="input-group">
                  <label>Shop Phone (optional)</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handlePrint} className="btn btn-primary">🖨️ Print Poster</button>
              <button onClick={handleDownloadQR} className="btn btn-outline" disabled={!qrCode}>⬇️ Download QR Only</button>
              <button onClick={generateQR} className="btn btn-outline">🔄 Regenerate QR</button>
            </div>
          </div>

          {/* POSTER */}
          <div className="poster-wrap">
            <div style={{
              background: '#ffffff', borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)', width: '100%',
              maxWidth: '500px', margin: '0 auto', border: '2px solid #e8e0cc',
            }}>

              {/* Header with shop name */}
              <div style={{ background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%)', padding: '36px 32px 28px', textAlign: 'center' }}>
                <div style={{ color: '#D4AF37', fontSize: '11px', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '14px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  📸 Professional Photo Studio
                </div>
                <div style={{ color: '#ffffff', fontSize: '36px', fontWeight: 900, lineHeight: 1.15, marginBottom: '6px', fontFamily: "'Playfair Display', serif" }}>
                  {shopName || 'Your Studio Name'}
                </div>
                {phone && (
                  <div style={{ color: '#D4AF37', fontSize: '15px', fontFamily: 'DM Sans, sans-serif', marginTop: '10px', fontWeight: 600 }}>
                    📞 {phone}
                  </div>
                )}
              </div>

              {/* Gold bar */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #b8942a, #D4AF37, #f0cc60, #D4AF37, #b8942a)' }} />

              {/* QR + Content */}
              <div style={{ background: '#fafaf8', padding: '36px 32px 28px', textAlign: 'center' }}>

                {/* QR Code */}
                <div style={{ display: 'inline-block', padding: '14px', background: '#ffffff', borderRadius: '16px', border: '3px solid #1a1a2e', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginBottom: '20px' }}>
                  {loading ? (
                    <div style={{ width: '200px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '13px', gap: '8px' }}>
                      <div style={{ fontSize: '32px' }}>⏳</div>
                      Generating QR...
                    </div>
                  ) : qrCode ? (
                    <img src={qrCode} alt="Shop QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                  ) : null}
                </div>

                <div style={{ color: '#1a1a2e', fontSize: '20px', fontWeight: 800, marginBottom: '6px', fontFamily: "'Playfair Display', serif" }}>
                  📱 Scan to Place Order
                </div>
                <div style={{ color: '#666', fontSize: '13px', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, marginBottom: '28px' }}>
                  {tagline}
                </div>

                {/* Steps */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                  {steps.map(([icon, title, desc]) => (
                    <div key={title} style={{ background: '#ffffff', borderRadius: '12px', padding: '14px 10px', textAlign: 'center', border: '1px solid #e8e0cc', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      <div style={{ fontSize: '22px', marginBottom: '5px' }}>{icon}</div>
                      <div style={{ color: '#1a1a2e', fontSize: '12px', fontWeight: 700, fontFamily: 'DM Sans, sans-serif', marginBottom: '2px' }}>{title}</div>
                      <div style={{ color: '#999', fontSize: '10px', fontFamily: 'DM Sans, sans-serif' }}>{desc}</div>
                    </div>
                  ))}
                </div>

                {/* Services */}
                <div style={{ background: '#1a1a2e', borderRadius: '14px', padding: '18px 20px', textAlign: 'left' }}>
                  <div style={{ color: '#D4AF37', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, marginBottom: '14px', textAlign: 'center' }}>
                    Our Services & Prices
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {services.map(([icon, name, price]) => (
                      <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ color: '#cccccc', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>{icon} {name}</span>
                        <span style={{ color: '#D4AF37', fontSize: '13px', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: 'linear-gradient(90deg, #b8942a, #D4AF37, #f0cc60, #D4AF37, #b8942a)', padding: '14px 32px', textAlign: 'center' }}>
                <div style={{ color: '#1a1a2e', fontSize: '11px', fontWeight: 800, fontFamily: 'DM Sans, sans-serif', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  {shopName} • Digital Order System
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}