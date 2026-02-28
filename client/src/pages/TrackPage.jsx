import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STATUS_STEPS = ['pending', 'processing', 'ready', 'completed'];

const STATUS_INFO = {
  pending:    { icon: '⏳', label: 'Order Received',    color: 'var(--warning)', desc: 'Your order has been received and is in queue' },
  processing: { icon: '🖨️', label: 'Being Processed',  color: 'var(--info)',    desc: 'We are working on your photos right now' },
  ready:      { icon: '✅', label: 'Ready for Pickup',  color: 'var(--success)', desc: 'Your photos are ready! Please visit the shop' },
  completed:  { icon: '🎉', label: 'Completed',         color: 'var(--gold)',    desc: 'Order completed. Thank you for visiting!' },
  cancelled:  { icon: '❌', label: 'Cancelled',         color: 'var(--danger)',  desc: 'This order was cancelled' },
};

export default function TrackPage() {
  const { orderId: paramId } = useParams();
  const [orderId, setOrderId] = useState(paramId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (paramId) trackOrder(paramId); }, [paramId]);

  const trackOrder = async (id) => {
    const trackId = id || orderId.trim();
    if (!trackId) return toast.error('Please enter your Order ID');
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/track/${trackId}`);
      setOrder(data);
    } catch (err) {
      toast.error('Order not found. Please check your Order ID');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = order ? (STATUS_INFO[order.orderStatus] || STATUS_INFO.pending) : null;
  const stepIndex = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>

        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Track Your <span className="text-gold">Order</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter your Order ID to check the status</p>
        </div>

        {/* Search */}
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <div className="input-group">
            <label>Order ID</label>
            <input
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. CQ-XXXXXXXX"
              onKeyDown={e => e.key === 'Enter' && trackOrder()}
              style={{ fontSize: '18px', letterSpacing: '1px' }}
            />
          </div>
          <button onClick={() => trackOrder()} className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <span className="spinner" /> : '🔍 Track Order'}
          </button>
        </div>

        {/* Result */}
        {order && (
          <div className="card fade-in">
            {/* Status Banner */}
            <div style={{
              background: `${statusInfo.color}15`,
              border: `1px solid ${statusInfo.color}40`,
              borderRadius: 'var(--radius)', padding: '20px',
              textAlign: 'center', marginBottom: '28px',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>{statusInfo.icon}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: statusInfo.color, marginBottom: '4px' }}>{statusInfo.label}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{statusInfo.desc}</div>
            </div>

            {/* Status Timeline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '18px', left: '10%', right: '10%', height: '2px', background: 'var(--border)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '18px', left: '10%', height: '2px', background: 'var(--gold)', zIndex: 1, width: `${Math.max(0, stepIndex) * (80 / (STATUS_STEPS.length - 1))}%`, transition: 'width 0.5s ease' }} />
              {STATUS_STEPS.map((s, i) => {
                const done = i <= stepIndex;
                const info = STATUS_INFO[s];
                return (
                  <div key={s} style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', margin: '0 auto 8px',
                      background: done ? 'var(--gold)' : 'var(--surface2)',
                      border: `2px solid ${done ? 'var(--gold)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', transition: 'all 0.3s',
                    }}>
                      {done ? '✓' : <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{i + 1}</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: done ? 'var(--gold)' : 'var(--text-muted)', fontWeight: done ? 700 : 400, textTransform: 'capitalize' }}>{s}</div>
                  </div>
                );
              })}
            </div>

            {/* Order Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['Order ID', order.orderId],
                ['Queue Number', `#${order.queueNumber}`],
                ['Customer', order.customer?.name],
                ['Service', order.serviceType],
                ['Quantity', order.quantity],
                ['Amount Paid', `₹${order.totalAmount}`],
                ['Payment', order.paymentStatus],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: label === 'Queue Number' ? 'var(--gold)' : 'var(--text)' }}>{value}</span>
                </div>
              ))}
            </div>

            {order.orderStatus === 'ready' && (
              <div style={{ background: 'rgba(45,216,130,0.1)', border: '1px solid rgba(45,216,130,0.3)', borderRadius: 'var(--radius)', padding: '16px', marginTop: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎉</div>
                <div style={{ color: 'var(--success)', fontWeight: 700 }}>Your photos are ready!</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Please visit the shop and show your Order ID: <strong>{order.orderId}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}