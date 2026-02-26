import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SERVICE_LABELS = {
  passport: { label: 'Passport Size Photo', icon: '🪪' },
  print_4x6: { label: 'Photo Print 4×6', icon: '🖼️' },
  print_a4: { label: 'Photo Print A4', icon: '📄' },
  lamination: { label: 'Lamination', icon: '✨' },
  school_id: { label: 'School ID Card Photo', icon: '🎓' },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prices, setPrices] = useState({});
  const [shopInfo, setShopInfo] = useState({ name: '', phone: '', address: '', hours: '' });
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [loadingShop, setLoadingShop] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [pricesRes, shopRes] = await Promise.all([
        api.get('/settings/prices'),
        api.get('/settings/shop-info'),
      ]);
      setPrices(pricesRes.data);
      setShopInfo(shopRes.data);
    } catch (err) {
      toast.error('Failed to load settings');
    }
  };

  const savePrices = async () => {
    setLoadingPrices(true);
    try {
      const numericPrices = {};
      for (const [k, v] of Object.entries(prices)) numericPrices[k] = Number(v);
      await api.put('/settings/prices', { prices: numericPrices });
      toast.success('✅ Prices updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update prices');
    } finally {
      setLoadingPrices(false);
    }
  };

  const saveShopInfo = async () => {
    setLoadingShop(true);
    try {
      await api.put('/settings/shop-info', shopInfo);
      toast.success('✅ Shop info updated!');
    } catch (err) {
      toast.error('Failed to update shop info');
    } finally {
      setLoadingShop(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>

        <div className="fade-in" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Shop <span className="text-gold">Settings</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your pricing and shop information</p>
        </div>

        {/* Price Management */}
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>💰 Service Pricing</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>
            Changes apply immediately to all new orders
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(SERVICE_LABELS).map(([id, { label, icon }]) => (
              <div key={id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '16px', background: 'var(--surface2)',
                borderRadius: 'var(--radius)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: '24px' }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per piece</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>₹</span>
                  <input
                    type="number"
                    min={1}
                    value={prices[id] || ''}
                    onChange={(e) => setPrices((p) => ({ ...p, [id]: e.target.value }))}
                    style={{ width: '80px', textAlign: 'center', fontWeight: 700, fontSize: '18px', color: 'var(--gold)' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={savePrices}
            className="btn btn-primary"
            disabled={loadingPrices}
            style={{ marginTop: '24px', width: '100%' }}
          >
            {loadingPrices ? <span className="spinner" /> : '💾 Save Prices'}
          </button>
        </div>

        {/* Shop Info */}
        <div className="card fade-in fade-in-delay-1">
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>🏪 Shop Information</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>
            Shown on notifications and QR poster
          </p>

          <div className="input-group">
            <label>Shop Name</label>
            <input
              value={shopInfo.name}
              onChange={(e) => setShopInfo((s) => ({ ...s, name: e.target.value }))}
              placeholder="e.g. Star Photo Studio"
            />
          </div>
          <div className="input-group">
            <label>Shop Phone</label>
            <input
              value={shopInfo.phone}
              onChange={(e) => setShopInfo((s) => ({ ...s, phone: e.target.value }))}
              placeholder="Your contact number"
            />
          </div>
          <div className="input-group">
            <label>Address</label>
            <textarea
              rows={2}
              value={shopInfo.address}
              onChange={(e) => setShopInfo((s) => ({ ...s, address: e.target.value }))}
              placeholder="Shop address for customers"
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className="input-group">
            <label>Business Hours</label>
            <input
              value={shopInfo.hours}
              onChange={(e) => setShopInfo((s) => ({ ...s, hours: e.target.value }))}
              placeholder="e.g. Mon-Sat: 9 AM – 9 PM"
            />
          </div>

          <button
            onClick={saveShopInfo}
            className="btn btn-primary"
            disabled={loadingShop}
            style={{ width: '100%' }}
          >
            {loadingShop ? <span className="spinner" /> : '💾 Save Shop Info'}
          </button>
        </div>
      </div>
    </div>
  );
}
