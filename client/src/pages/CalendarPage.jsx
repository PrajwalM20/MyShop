import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EVENT_TYPES = [
  { id: 'wedding',      label: '💍 Wedding',            color: '#e74c3c' },
  { id: 'baby_shower',  label: '👶 Baby Shower / Simantha', color: '#9b59b6' },
  { id: 'housewarming', label: '🏠 House Warming / Seremani', color: '#e67e22' },
  { id: 'birthday',     label: '🎂 Birthday Party',     color: '#3498db' },
  { id: 'graduation',   label: '🎓 Graduation',         color: '#1abc9c' },
  { id: 'corporate',    label: '💼 Corporate Event',    color: '#2c3e50' },
  { id: 'portrait',     label: '📸 Portrait Session',   color: '#d4af37' },
  { id: 'other',        label: '✨ Other',               color: '#7f8c8d' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad(n) { return String(n).padStart(2, '0'); }
function toDateStr(y, m, d) { return `${y}-${pad(m+1)}-${pad(d)}`; }

export default function CalendarPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const today = new Date();

  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [bookings, setBookings] = useState({});  // { "2026-03-20": booking }
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // selected date string
  const [showForm, setShowForm] = useState(false);
  const [ownerEdit, setOwnerEdit] = useState(false);
  const [form, setForm] = useState({ clientName:'', clientPhone:'', clientAddress:'', eventType:'wedding', notes:'' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadMonth(); }, [year, month]);

  const loadMonth = async () => {
    setLoading(true);
    try {
      const monthStr = `${year}-${pad(month+1)}`;
      const { data } = await api.get(`/bookings?month=${monthStr}`);
      const map = {};
      data.forEach(b => { map[b.date] = b; });
      setBookings(map);
    } catch { toast.error('Failed to load calendar'); }
    finally { setLoading(false); }
  };

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const dayStatus = (d) => {
    if (!d) return null;
    const ds = toDateStr(year, month, d);
    const b = bookings[ds];
    if (!b) return 'free';
    return b.status;
  };

  const statusStyle = (status, isToday) => {
    const base = { borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', border: '2px solid transparent', padding: '6px 4px', position: 'relative' };
    if (isToday) base.border = '2px solid var(--gold)';
    if (status === 'booked')    return { ...base, background: 'rgba(231,76,60,0.15)' };
    if (status === 'blocked')   return { ...base, background: 'rgba(52,73,94,0.4)' };
    return { ...base, background: 'rgba(45,216,130,0.07)' };
  };

  const selectDay = (d) => {
    if (!d) return;
    const ds = toDateStr(year, month, d);
    setSelected(ds);
    setForm({ clientName:'', clientPhone:'', clientAddress:'', eventType:'wedding', notes:'' });
    setShowForm(false);
    setOwnerEdit(false);
  };

  const selectedBooking = selected ? bookings[selected] : null;
  const isSelectedPast = selected && new Date(selected) < new Date(today.toDateString());

  const submitBooking = async () => {
    if (!form.clientName.trim()) return toast.error('Please enter your name');
    if (!/^\d{10}$/.test(form.clientPhone)) return toast.error('Enter valid 10-digit phone');
    if (!form.eventType) return toast.error('Please select event type');
    setSubmitting(true);
    try {
      await api.post('/bookings', { date: selected, ...form });
      toast.success('📅 Booking request submitted! We will contact you to confirm.');
      setShowForm(false);
      setForm({ clientName:'', clientPhone:'', clientAddress:'', eventType:'wedding', notes:'' });
      loadMonth();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking');
    } finally { setSubmitting(false); }
  };

  const ownerUpdate = async (newStatus) => {
    setSubmitting(true);
    try {
      await api.put(`/bookings/${selected}`, { ...selectedBooking, status: newStatus });
      toast.success(`Date marked as ${newStatus}`);
      loadMonth();
      setOwnerEdit(false);
    } catch { toast.error('Failed to update'); }
    finally { setSubmitting(false); }
  };

  const ownerBlock = async () => {
    setSubmitting(true);
    try {
      await api.put(`/bookings/${selected}`, { status: 'blocked', clientName:'', clientPhone:'', clientAddress:'', eventType:'', notes: form.notes || 'Blocked by owner' });
      toast.success('Date blocked');
      loadMonth();
    } catch { toast.error('Failed to block'); }
    finally { setSubmitting(false); }
  };

  const ownerDelete = async () => {
    if (!window.confirm('Clear this booking?')) return;
    try {
      await api.delete(`/bookings/${selected}`);
      toast.success('Booking cleared');
      setSelected(null);
      loadMonth();
    } catch { toast.error('Failed to delete'); }
  };

  const eventInfo = EVENT_TYPES.find(e => e.id === (selectedBooking?.eventType || form.eventType));

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '900px' }}>

        {/* Header */}
        <div className="fade-in" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '6px' }}>📅 Booking <span className="text-gold">Calendar</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {isOwner ? 'Manage bookings and block dates' : 'Check availability and book a photography session'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Calendar */}
          <div className="card fade-in">
            {/* Month nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <button onClick={prevMonth} className="btn btn-outline btn-sm">← Prev</button>
              <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)' }}>
                {MONTHS[month]} {year}
              </h2>
              <button onClick={nextMonth} className="btn btn-outline btn-sm">Next →</button>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {[
                { color: 'rgba(45,216,130,0.3)', label: 'Available' },
                { color: 'rgba(231,76,60,0.4)', label: 'Booked' },
                { color: 'rgba(52,73,94,0.6)', label: 'Blocked' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                <div className="spinner" style={{ margin: '0 auto 12px', width: '32px', height: '32px' }} />
                Loading...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {cells.map((d, i) => {
                  const ds = d ? toDateStr(year, month, d) : null;
                  const status = dayStatus(d);
                  const isTod = ds === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
                  const isSel = ds === selected;
                  const isPast = ds && new Date(ds) < new Date(today.toDateString());
                  return (
                    <div key={i}
                      onClick={() => d && selectDay(d)}
                      style={{
                        ...statusStyle(status, isTod),
                        textAlign: 'center',
                        minHeight: '52px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        outline: isSel ? '2px solid var(--gold)' : 'none',
                        outlineOffset: '1px',
                        opacity: isPast ? 0.45 : 1,
                        cursor: d ? 'pointer' : 'default',
                      }}
                    >
                      {d && (
                        <>
                          <span style={{ fontSize: '15px', fontWeight: isTod ? 900 : 500, color: isTod ? 'var(--gold)' : 'var(--text)' }}>{d}</span>
                          {status === 'booked'  && <span style={{ fontSize: '8px', color: '#e74c3c', fontWeight: 700 }}>BOOKED</span>}
                          {status === 'blocked' && <span style={{ fontSize: '8px', color: '#95a5a6', fontWeight: 700 }}>BLOCKED</span>}
                          {status === 'free'    && !isPast && <span style={{ fontSize: '8px', color: 'var(--success)', fontWeight: 600 }}>FREE</span>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected day panel */}
          {selected && (
            <div className="card fade-in" style={{ border: '1px solid rgba(212,175,55,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '20px' }}>
                    {new Date(selected + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    {!selectedBooking && <span style={{ color: 'var(--success)', fontWeight: 700 }}>✅ Available for booking</span>}
                    {selectedBooking?.status === 'booked'  && <span style={{ color: '#e74c3c', fontWeight: 700 }}>🔴 Already Booked</span>}
                    {selectedBooking?.status === 'blocked' && <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>⛔ Not Available</span>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
              </div>

              {/* Show booking info if booked */}
              {selectedBooking?.status === 'booked' && (
                <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Booking Details</div>
                  {[
                    ['Name', selectedBooking.clientName],
                    ['Phone', selectedBooking.clientPhone],
                    ['Event', EVENT_TYPES.find(e => e.id === selectedBooking.eventType)?.label || selectedBooking.eventType],
                    selectedBooking.notes && ['Notes', selectedBooking.notes],
                  ].filter(Boolean).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: '12px', marginBottom: '6px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: '60px' }}>{k}:</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedBooking?.status === 'blocked' && (
                <div style={{ padding: '14px', background: 'rgba(52,73,94,0.3)', borderRadius: 'var(--radius)', marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  ⛔ This date is not available for booking. {selectedBooking.notes && `— ${selectedBooking.notes}`}
                </div>
              )}

              {/* Client booking form */}
              {!isOwner && !selectedBooking && !isSelectedPast && !showForm && (
                <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ width: '100%' }}>
                  📅 Book This Date
                </button>
              )}
              {!isOwner && isSelectedPast && <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>This date has already passed.</p>}
              {!isOwner && selectedBooking?.status === 'booked' && <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>This date is taken. Please choose another date.</p>}

              {!isOwner && showForm && (
                <div>
                  <h4 style={{ marginBottom: '16px', fontSize: '16px' }}>Your Booking Details</h4>
                  <div className="input-group">
                    <label>Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input value={form.clientName} onChange={e => setForm(f => ({...f, clientName: e.target.value}))} placeholder="Your full name" />
                  </div>
                  <div className="input-group">
                    <label>Phone Number <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input value={form.clientPhone} onChange={e => setForm(f => ({...f, clientPhone: e.target.value}))} placeholder="10-digit mobile" maxLength={10} />
                  </div>
                  <div className="input-group">
                    <label>Address</label>
                    <textarea value={form.clientAddress} onChange={e => setForm(f => ({...f, clientAddress: e.target.value}))} placeholder="Your address" rows={2} style={{ resize: 'vertical' }} />
                  </div>
                  <div className="input-group">
                    <label>Purpose / Event Type <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {EVENT_TYPES.map(e => (
                        <div key={e.id} onClick={() => setForm(f => ({...f, eventType: e.id}))} style={{
                          padding: '10px 12px', borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                          border: `2px solid ${form.eventType === e.id ? e.color : 'var(--border)'}`,
                          background: form.eventType === e.id ? `${e.color}18` : 'var(--surface2)',
                          transition: 'all 0.15s',
                        }}>{e.label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Additional Notes</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Anything specific you want us to know..." rows={2} style={{ resize: 'vertical' }} />
                  </div>
                  <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    📞 After submitting, we will call you to confirm the booking and discuss pricing.
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowForm(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={submitBooking} className="btn btn-primary" disabled={submitting} style={{ flex: 2 }}>
                      {submitting ? <span className="spinner" /> : '📅 Submit Booking Request'}
                    </button>
                  </div>
                </div>
              )}

              {/* Owner controls */}
              {isOwner && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {selectedBooking?.status === 'booked' && (
                    <button onClick={() => ownerUpdate('available')} className="btn btn-sm" style={{ background: 'rgba(45,216,130,0.1)', border: '1px solid var(--success)', color: 'var(--success)' }} disabled={submitting}>
                      ✅ Mark Available
                    </button>
                  )}
                  {(!selectedBooking || selectedBooking.status === 'available') && (
                    <button onClick={ownerBlock} className="btn btn-sm" style={{ background: 'rgba(52,73,94,0.4)', border: '1px solid #7f8c8d', color: '#ecf0f1' }} disabled={submitting}>
                      ⛔ Block This Date
                    </button>
                  )}
                  {selectedBooking && (
                    <button onClick={ownerDelete} className="btn btn-sm btn-danger" disabled={submitting}>🗑 Clear</button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}