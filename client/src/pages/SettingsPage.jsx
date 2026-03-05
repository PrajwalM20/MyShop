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
  const [savingShop, setSavingShop] = useState(false);

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

  const updateService = (id, field, value) => {
    setServices(s => s.map(svc => svc.id === id ? { ...svc, [field]: value } : svc));
  };

  const saveServices = async () => {
    setSavingServices(true);
    try {
      await api.put('/settings/services', { services });
      toast.success('✅ Services & prices saved to database!');
    } catch { toast.error('Failed to save'); }
    finally { setSavingServices(false); }
  };

  const saveShop = async () => {
    setSavingShop(true);
    try {
      await api.put('/settings/shop-info', shopInfo);
      toast.success('✅ Shop info saved!');
    } catch { toast.error('Failed to save shop info'); }
    finally { setSavingShop(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '860px' }}>

        <div className="fade-in" style={{ marginBottom: '36px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '6px' }}>Shop <span className="text-gold">Settings</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Changes save directly to the database and reflect everywhere instantly</p>
        </div>

        {/* ── Services & Prices ─────────────────────────────────── */}
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>💰 Services & Pricing</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Changes apply to homepage, order page, and QR poster immediately</p>
            </div>
            <button onClick={saveServices} className="btn btn-primary" disabled={savingServices} style={{ minWidth: '160px' }}>
              {savingServices ? <span className="spinner" /> : '💾 Save to Database'}
            </button>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {services.map(svc => (
              <div key={svc.id} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 80px 80px 80px',
                gap: '12px', alignItems: 'center',
                padding: '14px 16px', background: 'var(--surface2)',
                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              }}>
                {/* Icon */}
                <span style={{ fontSize: '24px', textAlign: 'center' }}>{svc.icon}</span>

                {/* Name + desc */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{svc.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {svc.unit} · {svc.copies > 1 ? `${svc.copies} copies/unit` : '1 piece/unit'}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Price ₹</div>
                  <input
                    type="number" min={0} value={svc.price}
                    onChange={e => updateService(svc.id, 'price', Number(e.target.value))}
                    style={{ width: '100%', textAlign: 'center', fontWeight: 700, color: 'var(--gold)', fontSize: '15px', padding: '6px 8px' }}
                  />
                </div>

                {/* Copies */}
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Copies</div>
                  <input
                    type="number" min={1} value={svc.copies}
                    onChange={e => updateService(svc.id, 'copies', Number(e.target.value))}
                    style={{ width: '100%', textAlign: 'center', fontSize: '14px', padding: '6px 8px' }}
                  />
                </div>

                {/* TBD toggle */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Price TBD</div>
                  <div onClick={() => updateService(svc.id, 'priceTBD', !svc.priceTBD)} style={{
                    width: '40px', height: '22px', borderRadius: '100px', cursor: 'pointer',
                    background: svc.priceTBD ? 'var(--warning)' : 'var(--border)',
                    position: 'relative', transition: 'all 0.2s', margin: '0 auto',
                  }}>
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: svc.priceTBD ? '21px' : '3px',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: '#fff', transition: 'all 0.2s',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(212,175,55,0.06)', borderRadius: 'var(--radius)', border: '1px solid rgba(212,175,55,0.2)', fontSize: '12px', color: 'var(--text-muted)' }}>
            💡 <strong style={{ color: 'var(--gold)' }}>Price TBD</strong> = customer can select the service but price shown as "To Be Decided". Good for Flex banners where size determines price.
          </div>
        </div>

        {/* ── Shop Info ─────────────────────────────────────────── */}
        <div className="card fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>🏪 Shop Information</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Shown on homepage, notifications, and QR poster</p>
            </div>
            <button onClick={saveShop} className="btn btn-primary" disabled={savingShop} style={{ minWidth: '160px' }}>
              {savingShop ? <span className="spinner" /> : '💾 Save Shop Info'}
            </button>
          </div>

          <div className="grid-2" style={{ gap: '16px' }}>
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