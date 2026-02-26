import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STATUS_STEPS = ['pending', 'processing', 'ready', 'completed'];
const STATUS_INFO = {
  pending: { label: 'Order Received', icon: '📋', color: 'var(--warning)' },
  processing: { label: 'Being Processed', icon: '🖨️', color: 'var(--info)' },
  ready: { label: 'Ready for Pickup!', icon: '✅', color: 'var(--success)' },
  completed: { label: 'Completed', icon: '🎉', color: 'var(--gold)' },
  cancelled: { label: 'Cancelled', icon: '❌', color: 'var(--danger)' },
};

export default function TrackPage() {
  const { orderId: paramId } = useParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(paramId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const trackOrder = async (id = orderId) => {
    if (!id.trim()) return toast.error('Enter your Order ID');
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/track/${id.trim().toUpperCase()}`);
      setOrder(data);
    } catch (err) {
      toast.error('Order not found. Check your Order ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-track if orderId in URL
  useState(() => { if (paramId) trackOrder(paramId); }, []);

  const currentStepIdx = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '680px' }}>

        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '40px', marginBottom: '8px' }}>Track <span className="text-gold">Your Order</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Enter your Order ID to check status</p>
        </div>

        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="e.g. CQ-A1B2C3D4"
              style={{ flex: 1 }}
              onKeyDown={(e) => e.key === 'Enter' && trackOrder()}
            />
            <button onClick={() => trackOrder()} className="btn btn-primary" disabled={loading} style={{ minWidth: '120px' }}>
              {loading ? <span className="spinner" /> : '🔍 Track'}
            </button>
          </div>
        </div>

        {order && (
          <div className="fade-in">
            {/* Order header */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>ORDER ID</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)', fontWeight: 700 }}>{order.orderId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>QUEUE NUMBER</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 900, lineHeight: 1, color: 'var(--gold)' }}>#{order.queueNumber}</div>
                </div>
              </div>
              <div className="divider" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Customer: </span>{order.customer?.name}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Service: </span>{order.serviceType}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Quantity: </span>{order.quantity}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Amount: </span><strong style={{ color: 'var(--gold)' }}>₹{order.totalAmount}</strong></div>
              </div>
              <div className="divider" />
              <div style={{ display: 'flex', gap: '10px' }}>
                <span className={`badge badge-${order.paymentStatus}`}>💳 {order.paymentStatus}</span>
                <span className={`badge badge-${order.orderStatus}`}>
                  {STATUS_INFO[order.orderStatus]?.icon} {STATUS_INFO[order.orderStatus]?.label}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="card">
              <h3 style={{ marginBottom: '24px', fontSize: '16px' }}>Order Progress</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {STATUS_STEPS.map((status, i) => {
                  const info = STATUS_INFO[status];
                  const isCompleted = i <= currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  return (
                    <div key={status} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: isCompleted ? info.color : 'var(--surface2)',
                          border: `2px solid ${isCompleted ? info.color : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px', transition: 'all 0.3s',
                          boxShadow: isCurrent ? `0 0 16px ${info.color}66` : 'none',
                        }}>
                          {isCompleted ? '✓' : i + 1}
                        </div>
                        {i < STATUS_STEPS.length - 1 && (
                          <div style={{
                            width: '2px', height: '32px',
                            background: i < currentStepIdx ? info.color : 'var(--border)',
                            transition: 'all 0.3s',
                          }} />
                        )}
                      </div>
                      <div style={{ paddingTop: '6px', paddingBottom: '16px' }}>
                        <div style={{
                          fontSize: '15px', fontWeight: isCurrent ? 700 : 400,
                          color: isCompleted ? 'var(--text)' : 'var(--text-muted)',
                        }}>
                          {info.icon} {info.label}
                        </div>
                        {isCurrent && (
                          <div style={{ fontSize: '12px', color: info.color, marginTop: '2px' }}>
                            ← Current Status
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {order.orderStatus === 'ready' && (
                <div style={{
                  background: 'rgba(45,216,130,0.08)', border: '1px solid rgba(45,216,130,0.3)',
                  borderRadius: 'var(--radius)', padding: '16px', marginTop: '16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '4px' }}>Your photos are ready!</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Visit the shop and show your Order ID: <strong>{order.orderId}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
