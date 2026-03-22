import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: 'var(--warning)', processing: 'var(--info)',
  ready: 'var(--success)', completed: 'var(--gold)', cancelled: 'var(--danger)',
};

const TABS = [
  { id: 'orders',    label: ' Orders',    desc: 'View, edit, delete orders' },
  { id: 'customers', label: ' Customers',  desc: 'All unique customers' },
  { id: 'cleanup',   label: ' Cleanup',    desc: 'Bulk delete by status' },
];

export default function DataManagerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(new Set());
  const [editOrder, setEditOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const searchTimer = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
  }, []);

  useEffect(() => { if (tab === 'orders') loadOrders(); }, [tab, filter]);
  useEffect(() => { if (tab === 'customers') loadCustomers(); }, [tab]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { if (tab === 'orders') loadOrders(); }, 400);
  }, [search]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/owner/orders?status=${filter}&search=${search}&limit=100`);
      setOrders(data.orders);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/owner/customers');
      setCustomers(data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  // ── Single delete ────────────────────────────────────────────
  const deleteOne = async (id, name) => {
    if (!window.confirm(`Delete order from ${name}?\n\nThis cannot be undone.`)) return;
    try {
      await api.delete(`/owner/orders/${id}`);
      toast.success('Order deleted');
      loadOrders();
      setSelected(s => { const n = new Set(s); n.delete(id); return n; });
    } catch { toast.error('Failed to delete'); }
  };

  // ── Bulk delete ──────────────────────────────────────────────
  const bulkDelete = async () => {
    if (!selected.size) return toast.error('Select orders first');
    if (!window.confirm(`Delete ${selected.size} selected orders?\n\nThis cannot be undone.`)) return;
    try {
      await api.delete('/owner/orders/bulk', { data: { ids: [...selected] } });
      toast.success(`${selected.size} orders deleted`);
      setSelected(new Set());
      loadOrders();
    } catch { toast.error('Bulk delete failed'); }
  };

  // ── Edit save ────────────────────────────────────────────────
  const saveEdit = async () => {
    try {
      await api.put(`/owner/orders/${editOrder._id}`, editForm);
      toast.success(' Order updated!');
      setEditOrder(null);
      loadOrders();
    } catch { toast.error('Failed to update'); }
  };

  // ── Status update ────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/owner/orders/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      loadOrders();
    } catch { toast.error('Failed to update'); }
  };

  // ── Bulk clear ───────────────────────────────────────────────
  const clearByStatus = async (status) => {
    if (!window.confirm(`Delete ALL ${status} orders?\n\nThis cannot be undone.`)) return;
    try {
      const { data } = await api.delete(`/owner/orders/clear/${status}`);
      toast.success(data.message);
      loadOrders();
    } catch { toast.error('Failed to clear'); }
  };

  // ── Select all toggle ────────────────────────────────────────
  const toggleAll = () => {
    if (selected.size === orders.length) setSelected(new Set());
    else setSelected(new Set(orders.map(o => o._id)));
  };

  const toggleOne = (id) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const openEdit = (order) => {
    setEditOrder(order);
    setEditForm({
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerEmail: order.customer.email || '',
      notes: order.notes || '',
      serviceType: order.serviceType,
      quantity: order.quantity,
    });
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '1200px' }}>

        {/* Header */}
        <div className="fade-in" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '6px' }}>
            Data <span className="text-gold">Manager</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Full control over your orders and customer data</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '4px', marginBottom: '28px', width: 'fit-content', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'var(--gold)' : 'transparent',
              color: tab === t.id ? 'var(--black)' : 'var(--text-muted)',
              fontWeight: tab === t.id ? 700 : 400, fontFamily: 'var(--font-body)',
              fontSize: '14px', transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── ORDERS TAB ─────────────────────────────────────────── */}
        {tab === 'orders' && (
          <div className="fade-in">
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder=" Search by name, phone, order ID..."
                style={{ flex: '1', minWidth: '200px', maxWidth: '360px' }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['all','pending','processing','ready','completed','cancelled'].map(s => (
                  <button key={s} onClick={() => setFilter(s)} style={{
                    padding: '8px 14px', borderRadius: '100px', border: `1px solid ${filter === s ? 'var(--gold)' : 'var(--border)'}`,
                    background: filter === s ? 'var(--gold)' : 'var(--surface)',
                    color: filter === s ? 'var(--black)' : 'var(--text-muted)',
                    fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 'var(--radius)', marginBottom: '16px', flexWrap: 'wrap',
              }}>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{selected.size} selected</span>
                <button onClick={bulkDelete} className="btn btn-sm btn-danger"> Delete Selected</button>
                <button onClick={() => setSelected(new Set())} className="btn btn-sm btn-outline" style={{ fontSize: '12px' }}>Clear</button>
              </div>
            )}

            {/* Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                        <input type="checkbox" checked={selected.size === orders.length && orders.length > 0} onChange={toggleAll} />
                      </th>
                      {['Queue','Order ID','Customer','Phone','Service','Amount','Status','Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ margin: '0 auto 12px', width: '32px', height: '32px' }} />
                        Loading...
                      </td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No orders found</td></tr>
                    ) : orders.map(order => (
                      <tr key={order._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px' }}>
                          <input type="checkbox" checked={selected.has(order._id)} onChange={() => toggleOne(order._id)} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontWeight: 700, fontSize: '20px' }}>#{order.queueNumber}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '12px' }}>{order.orderId}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{order.customer?.name}</div>
                          {order.customer?.email && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.customer.email}</div>}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{order.customer?.phone}</td>
                        <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: 'var(--text-muted)' }}>{order.serviceType?.replace('_',' ')} ×{order.quantity}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gold)' }}>₹{order.totalAmount}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <select value={order.orderStatus} onChange={e => updateStatus(order._id, e.target.value)}
                            style={{ fontSize: '11px', padding: '4px 8px', minWidth: '110px', color: STATUS_COLORS[order.orderStatus] }}>
                            {['pending','processing','ready','completed','cancelled'].map(s => (
                              <option key={s} value={s} style={{ color: 'var(--text)' }}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {/* View */}
                            <button onClick={() => setViewOrder(order)} title="View Details" style={{ background: 'rgba(75,158,255,0.1)', border: '1px solid rgba(75,158,255,0.3)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' }}></button>
                            {/* Edit */}
                            <button onClick={() => openEdit(order)} title="Edit Order" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' }}>️</button>
                            {/* Delete */}
                            <button onClick={() => deleteOne(order._id, order.customer?.name)} title="Delete Order" style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', fontSize: '13px' }}></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span>{orders.length} orders shown</span>
                <button onClick={() => { const token = localStorage.getItem('cq_token'); window.open(`http://localhost:5000/api/owner/orders/export?token=${token}`, '_blank'); }} className="btn btn-sm btn-outline"> Export CSV</button>
              </div>
            </div>
          </div>
        )}

        {/* ── CUSTOMERS TAB ──────────────────────────────────────── */}
        {tab === 'customers' && (
          <div className="fade-in">
            <div style={{ marginBottom: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
              {customers.length} unique customers found
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                      {['Name','Phone','Email','Total Orders','Total Spent','Last Order'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ margin: '0 auto 12px', width: '32px', height: '32px' }} />
                        Loading...
                      </td></tr>
                    ) : customers.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No customers yet</td></tr>
                    ) : customers.map(c => (
                      <tr key={c._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>{c.name}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <a href={`tel:${c.phone}`} style={{ color: 'var(--gold)' }}> {c.phone}</a>
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {c.email ? <a href={`mailto:${c.email}`} style={{ color: 'var(--info)' }}>️ {c.email}</a> : <span style={{ color: 'var(--border)' }}>—</span>}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', borderRadius: '100px', padding: '3px 10px', fontWeight: 700 }}>{c.totalOrders}</span>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--success)' }}>₹{c.totalSpent}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {new Date(c.lastOrder).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CLEANUP TAB ────────────────────────────────────────── */}
        {tab === 'cleanup' && (
          <div className="fade-in">
            <div style={{ background: 'rgba(255,75,75,0.06)', border: '1px solid rgba(255,75,75,0.2)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: '28px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px' }}>️</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: '4px' }}>Danger Zone</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>These actions permanently delete data from the database. This cannot be undone.</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { status: 'completed', label: 'Completed Orders', icon: '', color: 'var(--gold)', desc: 'Remove old completed orders to free up space' },
                { status: 'cancelled', label: 'Cancelled Orders', icon: '', color: 'var(--danger)', desc: 'Remove all cancelled orders' },
                { status: 'pending',   label: 'Pending Orders',   icon: '⏳', color: 'var(--warning)', desc: 'Remove stuck pending orders' },
              ].map(({ status, label, icon, color, desc }) => (
                <div key={status} className="card" style={{ borderColor: 'rgba(255,75,75,0.15)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
                  <h3 style={{ fontSize: '16px', marginBottom: '6px', color }}>{label}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>{desc}</p>
                  <button onClick={() => clearByStatus(status)} className="btn btn-sm btn-danger" style={{ width: '100%' }}>
                     Delete All {label}
                  </button>
                </div>
              ))}
            </div>

            {/* Manual select delete from orders tab note */}
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}>
               To delete specific orders — go to the <strong style={{ color: 'var(--gold)' }}>Orders tab</strong>, check the boxes, then click <strong>Delete Selected</strong>.
            </div>
          </div>
        )}
      </div>

      {/* ── VIEW ORDER MODAL ─────────────────────────────────────── */}
      {viewOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px' }}
          onClick={() => setViewOrder(null)}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px' }}>Order <span className="text-gold">#{viewOrder.queueNumber}</span></h3>
              <button onClick={() => setViewOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}></button>
            </div>
            {[
              ['Order ID', viewOrder.orderId],
              ['Customer', viewOrder.customer?.name],
              ['Phone', viewOrder.customer?.phone],
              ['Email', viewOrder.customer?.email || '—'],
              ['Service', viewOrder.serviceType],
              ['Quantity', viewOrder.quantity],
              ['Amount', `₹${viewOrder.totalAmount}`],
              ['Payment', viewOrder.paymentStatus],
              ['Status', viewOrder.orderStatus],
              ['Notes', viewOrder.notes || '—'],
              ['Date', new Date(viewOrder.createdAt).toLocaleString('en-IN')],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: '16px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', flexShrink: 0 }}>{k}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', fontSize: '13px', textTransform: 'capitalize' }}>{String(v)}</span>
              </div>
            ))}
            {viewOrder.photos?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Photos ({viewOrder.photos.length})</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {viewOrder.photos.map((p, i) => (
                    <a key={i} href={p.url} target="_blank" rel="noreferrer">
                      <img src={p.url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { setViewOrder(null); openEdit(viewOrder); }} className="btn btn-outline" style={{ flex: 1 }}>️ Edit</button>
              <button onClick={() => { deleteOne(viewOrder._id, viewOrder.customer?.name); setViewOrder(null); }} className="btn btn-sm btn-danger" style={{ flex: 1 }}> Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT ORDER MODAL ─────────────────────────────────────── */}
      {editOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px' }}
          onClick={() => setEditOrder(null)}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px' }}>Edit Order <span className="text-gold">#{editOrder.queueNumber}</span></h3>
              <button onClick={() => setEditOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}></button>
            </div>
            <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
              ️ Changes save directly to the database
            </div>
            {[
              { label: 'Customer Name', key: 'customerName', type: 'text' },
              { label: 'Phone Number', key: 'customerPhone', type: 'text' },
              { label: 'Email (optional)', key: 'customerEmail', type: 'email' },
              { label: 'Quantity', key: 'quantity', type: 'number' },
            ].map(({ label, key, type }) => (
              <div className="input-group" key={key}>
                <label>{label}</label>
                <input type={type} value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="input-group">
              <label>Notes</label>
              <textarea value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setEditOrder(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              <button onClick={saveEdit} className="btn btn-primary" style={{ flex: 1 }}> Save to DB</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}