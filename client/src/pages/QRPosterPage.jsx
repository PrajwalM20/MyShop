import { useState, useEffect, useRef } from 'react';
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
  const [loading, setLoading] = useState(true);
  const posterRef = useRef();

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    generateQR();
  }, []);

  const generateQR = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/qr/generate');
      setQrCode(data.qrCode);
    } catch (err) {
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'clickqueue-qr.png';
    link.click();
  };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .poster-printable, .poster-printable * { visibility: visible; }
          .poster-printable { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="page">
        <div className="container" style={{ maxWidth: '900px' }}>

          {/* Controls - no-print */}
          <div className="no-print fade-in" style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
              🖨️ Shop <span className="text-gold">QR Poster</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Customize and print your QR code poster to paste outside your shop
            </p>

            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Customize Poster</h3>
              <div className="grid-2">
                <div className="input-group">
                  <label>Shop Name</label>
                  <input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Your Studio Name" />
                </div>
                <div className="input-group">
                  <label>Tagline</label>
                  <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short tagline..." />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handlePrint} className="btn btn-primary">🖨️ Print Poster</button>
              <button onClick={handleDownloadQR} className="btn btn-outline" disabled={!qrCode}>⬇️ Download QR Only</button>
              <button onClick={generateQR} className="btn btn-outline">🔄 Regenerate QR</button>
            </div>
          </div>

          {/* POSTER — this is what prints */}
          <div className="poster-printable" ref={posterRef}>
            <div style={{
              background: '#fff',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              width: '100%',
              maxWidth: '520px',
              margin: '0 auto',
              fontFamily: "'Playfair Display', serif",
            }}>
              {/* Poster Header */}
              <div style={{
                background: '#1a1a2e',
                padding: '40px 32px 32px',
                textAlign: 'center',
              }}>
                <div style={{ color: '#D4AF37', fontSize: '14px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif' }}>
                  📸 Smart Photo Studio
                </div>
                <div style={{ color: '#fff', fontSize: '32px', fontWeight: 900, lineHeight: 1.2, marginBottom: '8px' }}>
                  {shopName}
                </div>
                <div style={{ color: '#D4AF37', fontSize: '28px', fontWeight: 400, fontStyle: 'italic' }}>
                  ClickQueue
                </div>
              </div>

              {/* QR Code Section */}
              <div style={{
                background: '#fff',
                padding: '40px 32px',
                textAlign: 'center',
              }}>
                <div style={{
                  display: 'inline-block',
                  padding: '16px',
                  background: '#fff',
                  borderRadius: '16px',
                  border: '3px solid #1a1a2e',
                  marginBottom: '24px',
                }}>
                  {loading ? (
                    <div style={{ width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '14px' }}>
                      Generating QR...
                    </div>
                  ) : qrCode ? (
                    <img src={qrCode} alt="Order QR Code" style={{ width: '220px', height: '220px', display: 'block' }} />
                  ) : null}
                </div>

                <div style={{ color: '#1a1a2e', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
                  📱 Scan to Order
                </div>
                <div style={{ color: '#555', fontSize: '15px', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, marginBottom: '32px' }}>
                  {tagline}
                </div>

                {/* Steps */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  {[
                    ['📤', 'Upload Photos', 'Share your photos instantly'],
                    ['💳', 'Pay via UPI', 'GPay, PhonePe, Paytm'],
                    ['🔢', 'Get Queue No.', 'Skip the line completely'],
                    ['📱', 'Get Notified', 'WhatsApp alert when ready'],
                  ].map(([icon, title, desc]) => (
                    <div key={title} style={{
                      background: '#f9f8f5',
                      borderRadius: '12px',
                      padding: '16px 12px',
                      textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
                      <div style={{ color: '#1a1a2e', fontSize: '13px', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{title}</div>
                      <div style={{ color: '#888', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', marginTop: '2px' }}>{desc}</div>
                    </div>
                  ))}
                </div>

                {/* Services & Prices */}
                <div style={{
                  background: '#1a1a2e',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'left',
                  marginBottom: '24px',
                }}>
                  <div style={{ color: '#D4AF37', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: '12px', textAlign: 'center' }}>
                    Our Services
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      ['🪪 Passport Photo', '₹40/pc'],
                      ['🖼️ Print 4×6', '₹50/pc'],
                      ['📄 Print A4', '₹30/pc'],
                      ['✨ Lamination', '₹150/pc'],
                      ['🎓 School ID Photo', '₹50/pc'],
                    ].map(([service, price]) => (
                      <div key={service} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>{service}</span>
                        <span style={{ color: '#D4AF37', fontSize: '13px', fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>{price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: '#D4AF37', padding: '16px 32px', textAlign: 'center' }}>
                <div style={{ color: '#1a1a2e', fontSize: '13px', fontWeight: 700, fontFamily: 'DM Sans, sans-serif', letterSpacing: '1px' }}>
                  POWERED BY CLICKQUEUE • SMART PHOTO MANAGEMENT
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
