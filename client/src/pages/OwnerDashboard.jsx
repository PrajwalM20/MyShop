import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    loadData();
    startAutoRefresh();
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => { loadOrders(); }, [filter]);

  const startAutoRefresh = () => {
    // Auto refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      loadData(true); // silent = true (no loading spinner)
      setLastRefresh(new Date());
      setCountdown(30);
    }, 30000);

    // Countdown timer every second
    countdownRef.current = setInterval(() => {
      setCountdown(prev => prev <= 1 ? 30 : prev - 1);
    }, 1000);
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/owner/dashboard'),
        api.get('/owner/orders'),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data.orders);
      if (silent) toast.success('Dashboard refreshed', { duration: 1500, icon: '🔄' });
    } catch (err) {
      if (!silent) toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data } = await api.get(`/owner/orders?status=${filter}`);
      setOrders(data.orders);
    } catch (err) { }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/owner/orders/${orderId}/status`, { status });
      toast.success(`Order marked as ${status}`);
      loadData(true);
    } catch (err) { toast.error('Failed to update status'); }
  };

  const generateQR = async () => {
    try {
      const { data } = await api.get('/qr/generate');
      setQrCode(data.qrCode);
    } catch (err) { toast.error('Failed to generate QR'); }
  };

  const exportCSV = () => {
    const token = localStorage.getItem('cq_token');
    window.open(`http://localhost:5000/api/owner/orders/export?token=${token}`, '_blank');
  };

  const manualRefresh = () => {
    loadData(true);
    setLastRefresh(new Date());
    setCountdown(30);
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
    startAutoRefresh();
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div className="spinner" style={{ width: '48px', height: '48px' }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '1280px' }}>

        {/* Header */}
        <div className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '36px', marginBottom: '4px' }}>Owner <span className="text-gold">Dashboard</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Welcome back, {user?.name}</p>
          </div>

          {/* Auto-refresh status bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '8px 14px', fontSize: '13px',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: 'var(--success)',
                animation: 'pulse 2s ease infinite',
              }} />
              <span style={{ color: 'var(--text-muted)' }}>
                Auto-refresh in <strong style={{ color: 'var(--gold)' }}>{countdown}s</strong>
              </span>
              <button onClick={manualRefresh} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--gold)', fontSize: '16px', padding: '0 0 0 4px',
                lineHeight: 1,
              }} title="Refresh now">🔄</button>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Last: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <button onClick={generateQR} className="btn btn-outline btn-sm">📱 Get QR Code</button>
          <button onClick={exportCSV} className="btn btn-outline btn-sm">📤 Export CSV</button>
        </div>

        {/* QR Modal */}
        {qrCode && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: '24px',
          }} onClick={() => setQrCode(null)}>
            <div className="card" style={{ textAlign: 'center', maxWidth: '340px' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ marginBottom: '16px' }}>📱 Your Shop QR Code</h3>
              <img src={qrCode} alt="QR" style={{ width: '100%', borderRadius: '8px', background: '#fff', padding: '8px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '16px 0' }}>Print and paste outside your shop</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <a href="/api/qr/download" className="btn btn-primary" style={{ flex: 1 }}>⬇️ Download</a>
                <button onClick={() => setQrCode(null)} className="btn btn-outline" style={{ flex: 1 }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '4px', marginBottom: '32px', width: 'fit-content' }}>
          {['overview', 'orders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: activeTab === tab ? 'var(--gold)' : 'transparent',
              color: activeTab === tab ? 'var(--black)' : 'var(--text-muted)',
              fontWeight: activeTab === tab ? 700 : 400,
              fontFamily: 'var(--font-body)', fontSize: '14px',
              textTransform: 'capitalize', transition: 'all 0.2s',
            }}>
              {tab === 'overview' ? '📊 Overview' : '📋 Orders'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <>
            <div className="grid-4 fade-in" style={{ marginBottom: '32px' }}>
              {[
                { icon: '📦', label: "Today's Orders", value: stats.todayOrders, bg: 'rgba(212,175,55,0.1)' },
                { icon: '⏳', label: 'Pending', value: stats.pendingOrders, bg: 'rgba(255,179,71,0.1)' },
                { icon: '🖨️', label: 'Processing', value: stats.processingOrders, bg: 'rgba(75,158,255,0.1)' },
                { icon: '✅', label: 'Ready', value: stats.readyOrders, bg: 'rgba(45,216,130,0.1)' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg, fontSize: '24px' }}>{s.icon}</div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid-2 fade-in fade-in-delay-1" style={{ marginBottom: '32px' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, transparent 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total Revenue</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 900, color: 'var(--gold)', lineHeight: 1 }}>
                  ₹{stats.totalRevenue?.toLocaleString('en-IN')}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>{stats.completedOrders} orders completed</div>
              </div>
              <div className="card">
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Revenue — Last 7 Days</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={stats.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="_id" tick={{ fill: '#888', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#888', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Bar dataKey="revenue" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <div className="fade-in">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {['all', 'pending', 'processing', 'ready', 'completed', 'cancelled'].map(s => (
                <button key={s} onClick={() => setFilter(s)} className="btn btn-sm" style={{
                  background: filter === s ? 'var(--gold)' : 'var(--surface)',
                  color: filter === s ? 'var(--black)' : 'var(--text-muted)',
                  border: `1px solid ${filter === s ? 'var(--gold)' : 'var(--border)'}`,
                  textTransform: 'capitalize',
                }}>{s}</button>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Queue #', 'Order ID', 'Customer', 'Service', 'Photos', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 700, fontSize: '18px' }}>#{order.queueNumber}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{order.orderId}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div>{order.customer?.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{order.customer?.phone}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{order.serviceType} × {order.quantity}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {order.photos?.slice(0, 3).map((p, i) => (
                            <a key={i} href={p.url} target="_blank" rel="noreferrer">
                              <img src={p.url} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                            </a>
                          ))}
                          {order.photos?.length > 3 && <span style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '8px 4px' }}>+{order.photos.length - 3}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--gold)' }}>₹{order.totalAmount}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge badge-${order.paymentStatus}`}>{order.paymentStatus}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge badge-${order.orderStatus}`}>{order.orderStatus}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <select value={order.orderStatus} onChange={e => updateStatus(order._id, e.target.value)}
                          style={{ fontSize: '12px', padding: '6px 10px', minWidth: '120px' }}>
                          {['pending', 'processing', 'ready', 'completed', 'cancelled'].map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  No orders found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}