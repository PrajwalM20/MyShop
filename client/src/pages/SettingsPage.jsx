import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [shopInfo, setShopInfo] = useState({ name: '', phone: '', address: '', hours: '' });
  const [savingServices, setSavingServices] = useState(false);
  const [savingShop, setSavingShop]     = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [svcRes, shopRes] = await Promise.all([
        api.get('/settings/services'),
        api.get('/settings/shop-info'),
      ]);
      setServices(svcRes.data);
      setShopInfo(shopRes.data);
    } catch { toast.error('Failed to load settings'); }
  };

  const updateService = (id, field, value) =>
    setServices(s => s.map(svc => svc.id === id ? { ...svc, [field]: value } : svc));

  const saveServices = async () => {
    setSavingServices(true);
    try {
      await api.put('/settings/services', { services });
      toast.success(' Services & prices saved!');
      await loadAll();
    } catch { toast.error('Failed to save'); }
    finally { setSavingServices(false); }
  };

  const saveShop = async () => {
    setSavingShop(true);
    try {
      await api.put('/settings/shop-info', shopInfo);
      toast.success(' Shop info saved!');
    } catch { toast.error('Failed to save shop info'); }
    finally { setSavingShop(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '860px' }}>

        <div className="fade-in" style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '34px', marginBottom: '6px' }}>
            Shop <span className="text-gold">Settings</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Changes save to database and reflect everywhere instantly
          </p>
        </div>

        {/* ── Services & Prices ──────────────────────────────── */}
        <div className="card fade-in" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '4px' }}> Services & Pricing</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Changes apply to homepage, order page, and QR poster immediately
              </p>
            </div>
            <button onClick={saveServices} className="btn btn-primary" disabled={savingServices}
              style={{ minWidth: '160px', flexShrink: 0 }}>
              {savingServices ? <span className="spinner" /> : ' Save to Database'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {services.map(svc => (
              <div key={svc.id} style={{
                background: 'var(--surface2)', borderRadius: 'var(--radius)',
                border: '1px solid var(--border)', padding: '14px 16px',
              }}>
                {/* Top row — icon + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '26px', flexShrink: 0 }}>{svc.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {svc.label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {svc.unit} · {svc.copies > 1 ? `${svc.copies} copies/unit` : '1 piece'}
                    </div>
                  </div>
                </div>

                {/* Bottom row — price | copies | TBD toggle */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

                  {/* Price */}
                  <div style={{ flex: '1 1 80px', minWidth: '70px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Price ₹
                    </div>
                    <input
                      type="number" min={0}
                      value={svc.price}
                      onChange={e => updateService(svc.id, 'price', Number(e.target.value))}
                      style={{ width: '100%', textAlign: 'center', fontWeight: 700, color: 'var(--gold)', fontSize: '16px', padding: '8px 6px' }}
                    />
                  </div>

                  {/* Copies */}
                  <div style={{ flex: '1 1 70px', minWidth: '60px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Copies
                    </div>
                    <input
                      type="number" min={1}
                      value={svc.copies}
                      onChange={e => updateService(svc.id, 'copies', Number(e.target.value))}
                      style={{ width: '100%', textAlign: 'center', fontSize: '15px', padding: '8px 6px' }}
                    />
                  </div>

                  {/* Price TBD toggle */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      TBD
                    </div>
                    <div
                      onClick={() => updateService(svc.id, 'priceTBD', !svc.priceTBD)}
                      style={{
                        width: '46px', height: '26px', borderRadius: '100px', cursor: 'pointer',
                        background: svc.priceTBD ? 'var(--warning)' : 'var(--border)',
                        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                      }}>
                      <div style={{
                        position: 'absolute', top: '4px',
                        left: svc.priceTBD ? '23px' : '4px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }} />
                    </div>
                  </div>
                </div>

                {/* TBD hint */}
                {svc.priceTBD && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--warning)', fontStyle: 'italic' }}>
                    Price shown as "To Be Decided" to customers
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(212,175,55,0.06)', borderRadius: 'var(--radius)', border: '1px solid rgba(212,175,55,0.2)', fontSize: '13px', color: 'var(--text-muted)' }}>
             Toggle <strong style={{ color: 'var(--gold)' }}>TBD</strong> for services like Flex banners where price depends on size.
          </div>
        </div>

        {/* ── Shop Info ──────────────────────────────────────── */}
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '4px' }}> Shop Information</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Shown on homepage, notifications, and QR poster
              </p>
            </div>
            <button onClick={saveShop} className="btn btn-primary" disabled={savingShop}
              style={{ minWidth: '160px', flexShrink: 0 }}>
              {savingShop ? <span className="spinner" /> : ' Save Shop Info'}
            </button>
          </div>

          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="input-group">
              <label>Shop Name</label>
              <input value={shopInfo.name || ''} onChange={e => setShopInfo(s => ({ ...s, name: e.target.value }))} placeholder="e.g. Usha Photo Studio" />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input value={shopInfo.phone || ''} onChange={e => setShopInfo(s => ({ ...s, phone: e.target.value }))} placeholder="Your contact number" />
            </div>
          </div>
          <div className="input-group">
            <label>Address</label>
            <textarea rows={2} value={shopInfo.address || ''} onChange={e => setShopInfo(s => ({ ...s, address: e.target.value }))} placeholder="Shop address" style={{ resize: 'vertical' }} />
          </div>
          <div className="input-group">
            <label>Business Hours</label>
            <input value={shopInfo.hours || ''} onChange={e => setShopInfo(s => ({ ...s, hours: e.target.value }))} placeholder="e.g. Mon–Sat: 9 AM – 9 PM" />
          </div>
        </div>

      </div>
    </div>
  );
}