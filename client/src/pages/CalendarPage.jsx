import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
  { id: 'morning',   label: ' Morning',   time: '8:00 AM – 12:00 PM', color: '#f39c12' },
  { id: 'afternoon', label: ' Afternoon', time: '12:00 PM – 4:00 PM',  color: '#e67e22' },
  { id: 'evening',   label: ' Evening',   time: '4:00 PM – 8:00 PM',   color: '#8e44ad' },
];

const EVENT_TYPES = [
  { id: 'wedding',      label: ' Wedding',                  color: '#e74c3c' },
  { id: 'baby_shower',  label: ' Baby Shower / Simantha',   color: '#9b59b6' },
  { id: 'housewarming', label: ' House Warming / Seremani', color: '#e67e22' },
  { id: 'prewedding',   label: ' Pre-Wedding Shoot',        color: '#e91e8c' },
  { id: 'outdoor',      label: ' Outdoor Shoot',            color: '#27ae60' },
  { id: 'birthday',     label: ' Birthday Party',           color: '#3498db' },
  { id: 'graduation',   label: ' Graduation',               color: '#1abc9c' },
  { id: 'portrait',     label: ' Portrait Session',         color: '#d4af37' },
  { id: 'other',        label: ' Other',                     color: '#7f8c8d' },
];

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad(n) { return String(n).padStart(2,'0'); }
function toDateStr(y,m,d) { return `${y}-${pad(m+1)}-${pad(d)}`; }

// Multi-step booking form steps
const FORM_STEPS = ['Your Details', 'Choose Service', 'Confirm'];

const EMPTY_FORM = {
  clientName: '', clientPhone: '', clientAddress: '',
  eventType: '', notes: '', slot: '',
};

export default function CalendarPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const today   = new Date();

  const [year,       setYear]       = useState(today.getFullYear());
  const [month,      setMonth]      = useState(today.getMonth());
  const [bookings,   setBookings]   = useState({});
  const [loading,    setLoading]    = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [formStep,   setFormStep]   = useState(0); // 0=slots view, 1=details, 2=service, 3=confirm
  const [activeSlot, setActiveSlot] = useState('');
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo,setContactInfo]= useState(null);
  const [submitted,  setSubmitted]  = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => { loadMonth(); }, [year, month]);
  useEffect(() => {
    api.get('/about').then(({ data }) => setContactInfo(data)).catch(() => {});
  }, []);

  const loadMonth = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/bookings?month=${year}-${pad(month+1)}`);
      const map = {};
      data.forEach(b => { map[b.date] = b; });
      setBookings(map);
    } catch { toast.error('Failed to load calendar'); }
    finally { setLoading(false); }
  };

  const prevMonth = () => month === 0 ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1);
  const nextMonth = () => month === 11 ? (setYear(y=>y+1), setMonth(0))  : setMonth(m=>m+1);

  const firstDay    = new Date(year,month,1).getDay();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push(null);
  for (let d=1;d<=daysInMonth;d++) cells.push(d);
  while (cells.length%7!==0) cells.push(null);

  const getDayInfo = (d) => {
    if (!d) return null;
    const b = bookings[toDateStr(year,month,d)];
    if (!b) return { status:'free', freeSlots:3 };
    const slots = ['morning','afternoon','evening'];
    const booked  = slots.filter(s => b[s]?.status==='booked').length;
    const blocked = slots.filter(s => b[s]?.status==='blocked').length;
    const pending = slots.filter(s => b[s]?.status==='pending').length;
    const free    = 3 - booked - blocked - pending;
    if (free === 0 && blocked === 3) return { status:'blocked', freeSlots:0 };
    if (free === 0 && booked+blocked+pending === 3) return { status:'full', freeSlots:0 };
    if (pending > 0) return { status:'partial', freeSlots:free, hasPending: true };
    if (booked > 0 || blocked > 0) return { status:'partial', freeSlots:free };
    return { status:'free', freeSlots:3 };
  };

  const dayCellStyle = (status, isToday, isSel, isPast, hasPending) => ({
    borderRadius: '10px', cursor: isPast ? 'default' : 'pointer', transition: 'all 0.2s',
    border: `2px solid ${isSel ? 'var(--gold)' : isToday ? 'rgba(212,175,55,0.5)' : 'transparent'}`,
    background: status==='full'    ? 'rgba(231,76,60,0.15)'  :
                status==='blocked' ? 'rgba(52,73,94,0.4)'    :
                hasPending         ? 'rgba(75,158,255,0.15)' :
                status==='partial' ? 'rgba(255,179,71,0.15)' :
                                     'rgba(45,216,130,0.07)',
    padding:'6px 4px', textAlign:'center', minHeight:'52px',
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    opacity: isPast ? 0.4 : 1,
  });

  const selectedBooking = selected ? bookings[selected] : null;
  const isPast = selected && new Date(selected) < new Date(today.toDateString());
  const getSlotStatus = (slotId) => selectedBooking?.[slotId]?.status || 'free';

  const selectDay = (ds) => {
    setSelected(ds);
    setFormStep(0);
    setActiveSlot('');
    setForm(EMPTY_FORM);
    setSubmitted(false);
    setConfirmedBooking(null);
  };

  // Client clicks "Book This Slot"
  const startBooking = (slotId) => {
    setActiveSlot(slotId);
    setForm({ ...EMPTY_FORM, slot: slotId });
    setFormStep(1);
  };

  const validateStep1 = () => {
    if (!form.clientName.trim())          { toast.error('Please enter your name'); return false; }
    if (!/^\d{10}$/.test(form.clientPhone)) { toast.error('Enter valid 10-digit phone'); return false; }
    return true;
  };

  const submitBooking = async () => {
    if (!form.eventType) { toast.error('Please select the type of event'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        date: selected, slot: form.slot,
        clientName: form.clientName, clientPhone: form.clientPhone,
        clientAddress: form.clientAddress, eventType: form.eventType, notes: form.notes,
      });
      setConfirmedBooking(data.booking);
      setSubmitted(true);
      setFormStep(0);
      toast.success(' Booking submitted! We will contact you to confirm.');
      loadMonth();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit booking');
    } finally { setSubmitting(false); }
  };

  // Owner actions
  const ownerUpdateSlot = async (slotId, newStatus) => {
    setSubmitting(true);
    try {
      await api.put(`/bookings/${selected}/${slotId}`, { status: newStatus });
      toast.success(`${slotId} slot marked as ${newStatus}`);
      loadMonth();
    } catch { toast.error('Failed to update'); }
    finally { setSubmitting(false); }
  };

  const ownerClearSlot = async (slotId) => {
    if (!window.confirm(`Clear the ${slotId} slot?`)) return;
    try {
      await api.delete(`/bookings/${selected}/${slotId}`);
      toast.success('Slot cleared');
      loadMonth();
    } catch { toast.error('Failed to clear'); }
  };

  const slotInfo = TIME_SLOTS.find(s => s.id === activeSlot);
  const eventInfo = EVENT_TYPES.find(e => e.id === form.eventType);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '960px' }}>

        {/* Header */}
        <div className="fade-in" style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '34px', marginBottom: '6px' }}>
               Booking <span className="text-gold">Calendar</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            {isOwner
              ? 'Manage bookings and block time slots'
              : 'Check availability and book your photography session'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

          {/* ── CALENDAR ──────────────────────────────────────── */}
          <div className="card fade-in">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <button onClick={prevMonth} className="btn btn-outline btn-sm">← Prev</button>
              <h2 style={{ fontSize:'22px', fontFamily:'var(--font-display)' }}>{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="btn btn-outline btn-sm">Next →</button>
            </div>

            {/* Legend */}
            <div style={{ display:'flex', gap:'12px', marginBottom:'16px', flexWrap:'wrap' }}>
              {[
                { bg:'rgba(45,216,130,0.3)',  label:'All Slots Free' },
                { bg:'rgba(75,158,255,0.3)',  label:'Pending Request' },
                { bg:'rgba(255,179,71,0.3)',  label:'Partially Booked' },
                { bg:'rgba(231,76,60,0.3)',   label:'Fully Booked' },
                { bg:'rgba(52,73,94,0.6)',    label:'Blocked' },
              ].map(l => (
                <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'var(--text-muted)' }}>
                  <div style={{ width:'14px', height:'14px', borderRadius:'4px', background:l.bg, flexShrink:0 }} />{l.label}
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px', marginBottom:'4px' }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', padding:'4px' }}>{d}</div>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)' }}>
                <div className="spinner" style={{ margin:'0 auto 12px', width:'32px', height:'32px' }} />Loading...
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' }}>
                {cells.map((d,i) => {
                  const ds   = d ? toDateStr(year,month,d) : null;
                  const info = getDayInfo(d);
                  const isTod = ds === toDateStr(today.getFullYear(),today.getMonth(),today.getDate());
                  const isSel = ds === selected;
                  const isPst = ds && new Date(ds) < new Date(today.toDateString());
                  return (
                    <div key={i} onClick={() => d && !isPst && selectDay(ds)}
                      style={d ? dayCellStyle(info?.status, isTod, isSel, isPst, info?.hasPending) : {}}>
                      {d && (
                        <>
                          <span style={{ fontSize:'15px', fontWeight:isTod?900:500, color:isTod?'var(--gold)':'var(--text)' }}>{d}</span>
                          {info?.status==='full'    && <span style={{ fontSize:'8px', color:'#e74c3c',       fontWeight:700 }}>FULL</span>}
                          {info?.hasPending         && <span style={{ fontSize:'8px', color:'var(--info)',    fontWeight:700 }}>PENDING</span>}
                          {info?.status==='partial' && !info?.hasPending && <span style={{ fontSize:'8px', color:'var(--warning)', fontWeight:700 }}>{info.freeSlots} FREE</span>}
                          {info?.status==='blocked' && <span style={{ fontSize:'8px', color:'#95a5a6',        fontWeight:700 }}>BLOCKED</span>}
                          {info?.status==='free'    && !isPst && <span style={{ fontSize:'8px', color:'var(--success)', fontWeight:600 }}>FREE</span>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── SELECTED DAY PANEL ─────────────────────────────── */}
          {selected && (
            <div className="card fade-in" style={{ border:'1px solid rgba(212,175,55,0.3)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'8px' }}>
                <div>
                  <h3 style={{ fontSize:'20px', marginBottom:'4px' }}>
                    {new Date(selected+'T00:00:00').toLocaleDateString('en-IN',{ weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                  </h3>
                  {isPast && <span style={{ color:'var(--danger)', fontSize:'13px' }}> This date has already passed</span>}
                </div>
                <button onClick={() => { setSelected(null); setFormStep(0); }} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'22px', lineHeight:1 }}>×</button>
              </div>

              {/* ── SUCCESS STATE ─────────────────────────────── */}
              {submitted && confirmedBooking && (
                <div style={{ textAlign:'center', padding:'32px 20px', background:'rgba(45,216,130,0.06)', border:'1px solid rgba(45,216,130,0.25)', borderRadius:'var(--radius)', marginBottom:'16px' }}>
                  <h3 style={{ fontSize:'22px', color:'var(--success)', marginBottom:'8px' }}>Booking Request Sent!</h3>
                  <p style={{ color:'var(--text-muted)', fontSize:'15px', marginBottom:'16px' }}>
                    Thank you <strong>{confirmedBooking.clientName || form.clientName}</strong>!<br/>
                    We will call you on <strong>{confirmedBooking.clientPhone || form.clientPhone}</strong> to confirm your booking.
                  </p>
                  <div style={{ background:'var(--surface2)', borderRadius:'var(--radius)', padding:'14px', display:'inline-block', textAlign:'left', minWidth:'240px' }}>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'1px' }}>Booking Summary</div>
                    <div style={{ fontSize:'14px', marginBottom:'4px' }}><strong>Date:</strong> {new Date(selected+'T00:00:00').toLocaleDateString('en-IN',{ day:'numeric', month:'long', year:'numeric' })}</div>
                    <div style={{ fontSize:'14px', marginBottom:'4px' }}><strong>Time:</strong> {TIME_SLOTS.find(s=>s.id===form.slot)?.label} — {TIME_SLOTS.find(s=>s.id===form.slot)?.time}</div>
                    <div style={{ fontSize:'14px' }}><strong>Event:</strong> {EVENT_TYPES.find(e=>e.id===form.eventType)?.label}</div>
                  </div>
                  <div style={{ marginTop:'20px' }}>
                    <button onClick={() => { setSubmitted(false); setFormStep(0); setForm(EMPTY_FORM); }} className="btn btn-outline btn-sm">
                      Book Another Slot
                    </button>
                  </div>
                </div>
              )}

              {/* ── SLOT CARDS (Step 0) ───────────────────────── */}
              {!submitted && formStep === 0 && (
                <>
                  <p style={{ color:'var(--text-muted)', fontSize:'14px', marginBottom:'16px' }}>
                    {isOwner ? 'Select a slot to manage it.' : 'Select a free time slot below to book your session.'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'12px' }}>
                    {TIME_SLOTS.map(slot => {
                      const status    = getSlotStatus(slot.id);
                      const slotData  = selectedBooking?.[slot.id];
                      const evtInfo   = EVENT_TYPES.find(e => e.id === slotData?.eventType);
                      const isFree    = status === 'free' || status === 'available';
                      const isBooked  = status === 'booked';
                      const isBlocked = status === 'blocked';
                      const isPending = status === 'pending';
                      return (
                        <div key={slot.id} style={{
                          borderRadius:'var(--radius-lg)', padding:'18px',
                          border:`2px solid ${isBooked ? '#e74c3c44' : isBlocked ? '#34495e66' : isPending ? 'rgba(75,158,255,0.4)' : 'rgba(45,216,130,0.35)'}`,
                          background: isBooked  ? 'rgba(231,76,60,0.06)' :
                                      isBlocked ? 'rgba(52,73,94,0.18)'  :
                                                  'rgba(45,216,130,0.04)',
                          transition: 'all 0.2s',
                        }}>
                          {/* Slot header */}
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                            <div>
                              <div style={{ fontWeight:700, fontSize:'16px', marginBottom:'2px' }}>{slot.label}</div>
                              <div style={{ fontSize:'13px', color:'var(--text-muted)' }}>{slot.time}</div>
                            </div>
                            <div style={{
                              fontSize:'11px', fontWeight:700, padding:'4px 10px', borderRadius:'100px',
                              background: isBooked  ? 'rgba(231,76,60,0.15)' :
                                          isBlocked ? 'rgba(52,73,94,0.4)'   :
                                                      'rgba(45,216,130,0.15)',
                              color: isBooked  ? '#e74c3c' :
                                     isBlocked ? '#95a5a6' :
                                                 'var(--success)',
                            }}>
                              {isBooked ? 'BOOKED' : isBlocked ? 'BLOCKED' : isPending ? 'PENDING' : 'FREE'}
                            </div>
                          </div>

                          {/* Pending state */}
                          {isPending && slotData && (
                            <div style={{ fontSize:'13px', borderTop:'1px solid var(--border)', paddingTop:'10px', marginBottom:'10px' }}>
                              <div style={{ fontWeight:600, marginBottom:'4px', color:'var(--info)' }}>Pending Request</div>
                              {isOwner && (
                                <>
                                  <div style={{ fontWeight:600, color:'var(--text)', marginBottom:'2px' }}>{slotData.clientName}</div>
                                  <div style={{ color:'var(--text-muted)' }}>  {slotData.clientPhone}</div>
                                  {slotData.clientAddress && <div style={{ color:'var(--text-muted)', fontSize:'12px' }}>  {slotData.clientAddress}</div>}
                                  {EVENT_TYPES.find(e=>e.id===slotData.eventType) && <div style={{ color:EVENT_TYPES.find(e=>e.id===slotData.eventType).color, marginTop:'4px', fontWeight:600 }}>{EVENT_TYPES.find(e=>e.id===slotData.eventType).label}</div>}
                                  {slotData.notes && <div style={{ color:'var(--text-muted)', fontStyle:'italic', marginTop:'4px' }}>"{slotData.notes}"</div>}
                                </>
                              )}
                              {!isOwner && (
                                <div style={{ color:'var(--info)', fontSize:'13px' }}>Your request is pending. The owner will contact you to confirm.</div>
                              )}
                            </div>
                          )}

                          {/* Booked details (show to owner always, hide from client) */}
                          {isBooked && slotData && (
                            <div style={{ fontSize:'13px', borderTop:'1px solid var(--border)', paddingTop:'10px', marginBottom:'10px' }}>
                              {isOwner && (
                                <>
                                  <div style={{ fontWeight:600, marginBottom:'4px' }}>{slotData.clientName}</div>
                                  <div style={{ color:'var(--text-muted)' }}>  {slotData.clientPhone}</div>
                                  {slotData.clientAddress && <div style={{ color:'var(--text-muted)', fontSize:'12px' }}> {slotData.clientAddress}</div>}
                                  {evtInfo && <div style={{ color:evtInfo.color, marginTop:'4px', fontWeight:600 }}>{evtInfo.label}</div>}
                                  {slotData.notes && <div style={{ color:'var(--text-muted)', fontStyle:'italic', marginTop:'4px' }}>"{slotData.notes}"</div>}
                                </>
                              )}
                              {!isOwner && (
                                <div style={{ color:'var(--text-muted)', fontSize:'13px' }}>This slot is already booked. Please choose another slot or date.</div>
                              )}
                            </div>
                          )}

                          {/* Blocked info for client */}
                          {isBlocked && !isOwner && (
                            <div style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'8px' }}>
                              Not available. Please try another time slot.
                            </div>
                          )}

                          {/* Client — Book button */}
                          {!isOwner && (isFree) && !isPast && !isPending && (
                            <button onClick={() => startBooking(slot.id)}
                              className="btn btn-primary btn-sm"
                              style={{ width:'100%', marginTop:'8px', fontSize:'14px' }}>
                              Book This Slot
                            </button>
                          )}

                          {/* Owner controls */}
                          {isOwner && (
                            <div style={{ display:'flex', gap:'6px', marginTop:'10px', flexWrap:'wrap' }}>
                              {/* PENDING — show Accept + Decline */}
                              {isPending && (
                                <>
                                  <button onClick={() => ownerUpdateSlot(slot.id,'booked')}
                                    style={{ fontSize:'12px', padding:'6px 12px', background:'rgba(45,216,130,0.15)', border:'1px solid var(--success)', borderRadius:'6px', cursor:'pointer', color:'var(--success)', fontWeight:700 }}
                                    disabled={submitting}>Accept Booking</button>
                                  <button onClick={() => ownerClearSlot(slot.id)}
                                    style={{ fontSize:'12px', padding:'6px 12px', background:'rgba(255,75,75,0.1)', border:'1px solid var(--danger)', borderRadius:'6px', cursor:'pointer', color:'var(--danger)' }}
                                    disabled={submitting}>Decline</button>
                                </>
                              )}
                              {isFree && (
                                <button onClick={() => ownerUpdateSlot(slot.id,'blocked')}
                                  style={{ fontSize:'12px', padding:'5px 10px', background:'rgba(52,73,94,0.4)', border:'1px solid #7f8c8d', borderRadius:'6px', cursor:'pointer', color:'#ecf0f1' }}
                                  disabled={submitting}>Block</button>
                              )}
                              {/* BOOKED or BLOCKED — can free or clear */}
                              {(isBooked || isBlocked) && (
                                <>
                                  <button onClick={() => ownerUpdateSlot(slot.id,'available')}
                                    style={{ fontSize:'12px', padding:'5px 10px', background:'rgba(45,216,130,0.1)', border:'1px solid var(--success)', borderRadius:'6px', cursor:'pointer', color:'var(--success)' }}
                                    disabled={submitting}>Mark Free</button>
                                  <button onClick={() => ownerClearSlot(slot.id)}
                                    style={{ fontSize:'12px', padding:'5px 10px', background:'rgba(255,75,75,0.1)', border:'1px solid var(--danger)', borderRadius:'6px', cursor:'pointer', color:'var(--danger)' }}
                                    disabled={submitting}>Clear</button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ── BOOKING FORM STEP 1: DETAILS ─────────────── */}
              {!submitted && formStep === 1 && (
                <div>
                  {/* Mini stepper */}
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--gold)', color:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700 }}>1</div>
                      <span style={{ fontSize:'14px', color:'var(--gold)', fontWeight:600 }}>Your Details</span>
                    </div>
                    <div style={{ flex:1, height:'2px', background:'var(--border)', minWidth:'20px' }} />
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--surface2)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color:'var(--text-muted)' }}>2</div>
                      <span style={{ fontSize:'14px', color:'var(--text-muted)' }}>Choose Service</span>
                    </div>
                    <div style={{ flex:1, height:'2px', background:'var(--border)', minWidth:'20px' }} />
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--surface2)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color:'var(--text-muted)' }}>3</div>
                      <span style={{ fontSize:'14px', color:'var(--text-muted)' }}>Confirm</span>
                    </div>
                  </div>

                  <div style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:'20px', fontSize:'14px' }}>
                    <strong>{new Date(selected+'T00:00:00').toLocaleDateString('en-IN',{ weekday:'long', day:'numeric', month:'long' })}</strong>
                    &nbsp;—&nbsp;
                    <span style={{ color:'var(--gold)' }}>{slotInfo?.label} ({slotInfo?.time})</span>
                  </div>

                  <div className="input-group">
                    <label>Full Name <span style={{ color:'var(--danger)' }}>*</span></label>
                    <input value={form.clientName} onChange={e => setForm(f=>({...f,clientName:e.target.value}))} placeholder="Your full name" autoFocus />
                  </div>
                  <div className="input-group">
                    <label>Phone Number <span style={{ color:'var(--danger)' }}>*</span></label>
                    <div style={{ display:'flex' }}>
                      <span style={{ background:'var(--surface3)', border:'1px solid var(--border)', borderRight:'none', borderRadius:'var(--radius) 0 0 var(--radius)', padding:'12px 14px', color:'var(--text-muted)' }}>+91</span>
                      <input value={form.clientPhone} onChange={e => setForm(f=>({...f,clientPhone:e.target.value}))} placeholder="10-digit mobile" maxLength={10} style={{ borderRadius:'0 var(--radius) var(--radius) 0', borderLeft:'none' }} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Address (optional)</label>
                    <textarea value={form.clientAddress} onChange={e => setForm(f=>({...f,clientAddress:e.target.value}))} placeholder="Your address or area" rows={2} style={{ resize:'vertical' }} />
                  </div>

                  <div style={{ display:'flex', gap:'10px', marginTop:'8px' }}>
                    <button onClick={() => setFormStep(0)} className="btn btn-outline" style={{ flex:1 }}>← Back</button>
                    <button onClick={() => { if(validateStep1()) setFormStep(2); }} className="btn btn-primary" style={{ flex:2 }}>
                      Next: Choose Service →
                    </button>
                  </div>
                </div>
              )}

              {/* ── BOOKING FORM STEP 2: SERVICE ─────────────── */}
              {!submitted && formStep === 2 && (
                <div>
                  {/* Stepper */}
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'rgba(45,216,130,0.2)', border:'2px solid var(--success)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color:'var(--success)', fontWeight:700 }}></div>
                      <span style={{ fontSize:'14px', color:'var(--text-muted)' }}>Your Details</span>
                    </div>
                    <div style={{ flex:1, height:'2px', background:'var(--gold)', minWidth:'20px' }} />
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--gold)', color:'var(--black)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700 }}>2</div>
                      <span style={{ fontSize:'14px', color:'var(--gold)', fontWeight:600 }}>Choose Service</span>
                    </div>
                    <div style={{ flex:1, height:'2px', background:'var(--border)', minWidth:'20px' }} />
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--surface2)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color:'var(--text-muted)' }}>3</div>
                      <span style={{ fontSize:'14px', color:'var(--text-muted)' }}>Confirm</span>
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom:'8px' }}>
                    <label>What is the occasion? <span style={{ color:'var(--danger)' }}>*</span></label>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'20px' }}>
                    {EVENT_TYPES.map(e => (
                      <div key={e.id} onClick={() => setForm(f=>({...f,eventType:e.id}))} style={{
                        padding:'12px 14px', borderRadius:'var(--radius)', cursor:'pointer',
                        border:`2px solid ${form.eventType===e.id ? e.color : 'var(--border)'}`,
                        background: form.eventType===e.id ? `${e.color}18` : 'var(--surface2)',
                        fontSize:'14px', fontWeight: form.eventType===e.id ? 700 : 400,
                        transition:'all 0.15s', display:'flex', alignItems:'center', gap:'8px',
                      }}>
                        {e.label}
                      </div>
                    ))}
                  </div>

                  <div className="input-group">
                    <label>Additional Notes (optional)</label>
                    <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Any specific requirements, number of people, venue details..." rows={3} style={{ resize:'vertical' }} />
                  </div>

                  <div style={{ display:'flex', gap:'10px' }}>
                    <button onClick={() => setFormStep(1)} className="btn btn-outline" style={{ flex:1 }}>← Back</button>
                    <button onClick={() => { if(!form.eventType){ toast.error('Please select event type'); return; } setFormStep(3); }} className="btn btn-primary" style={{ flex:2 }}>
                      Next: Review →
                    </button>
                  </div>
                </div>
              )}

              {/* ── BOOKING FORM STEP 3: CONFIRM ─────────────── */}
              {!submitted && formStep === 3 && (
                <div>
                  {/* Stepper */}
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'24px', flexWrap:'wrap' }}>
                    {['Your Details','Choose Service','Confirm'].map((label,i) => (
                      <div key={label} style={{ display:'flex', alignItems:'center', gap:'6px', flex: i<2 ? '0 0 auto' : undefined }}>
                        <div style={{ width:'28px', height:'28px', borderRadius:'50%', background: i<2 ? 'rgba(45,216,130,0.2)' : 'var(--gold)', border: i<2 ? '2px solid var(--success)' : 'none', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color: i<2 ? 'var(--success)' : 'var(--black)', fontWeight:700 }}>
                          {i < 2 ? '' : '3'}
                        </div>
                        <span style={{ fontSize:'14px', color: i<2 ? 'var(--text-muted)' : 'var(--gold)', fontWeight: i===2 ? 600 : 400 }}>{label}</span>
                        {i < 2 && <div style={{ width:'24px', height:'2px', background:'var(--gold)', marginLeft:'4px' }} />}
                      </div>
                    ))}
                  </div>

                  <div style={{ background:'var(--surface2)', borderRadius:'var(--radius)', padding:'20px', marginBottom:'20px', border:'1px solid var(--border)' }}>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px' }}>Booking Summary</div>
                    {[
                      ['Date', new Date(selected+'T00:00:00').toLocaleDateString('en-IN',{ weekday:'long', day:'numeric', month:'long', year:'numeric' })],
                      ['Time Slot', `${slotInfo?.label} — ${slotInfo?.time}`],
                      ['Name', form.clientName],
                      ['Phone', `+91 ${form.clientPhone}`],
                      form.clientAddress && ['Address', form.clientAddress],
                      ['Event', eventInfo?.label],
                      form.notes && ['Notes', form.notes],
                    ].filter(Boolean).map(([k,v]) => (
                      <div key={k} style={{ display:'flex', gap:'16px', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'14px' }}>
                        <span style={{ color:'var(--text-muted)', minWidth:'80px', flexShrink:0 }}>{k}</span>
                        <span style={{ fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:'var(--radius)', padding:'12px 16px', marginBottom:'20px', fontSize:'14px', color:'var(--text-muted)' }}>
                    After submitting, we will call you on <strong>+91 {form.clientPhone}</strong> to confirm your booking and discuss pricing.
                  </div>

                  <div style={{ display:'flex', gap:'10px' }}>
                    <button onClick={() => setFormStep(2)} className="btn btn-outline" style={{ flex:1 }}>← Edit</button>
                    <button onClick={submitBooking} className="btn btn-primary" disabled={submitting} style={{ flex:2, fontSize:'15px' }}>
                      {submitting ? <span className="spinner" /> : 'Confirm Booking Request'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CONTACT SECTION ────────────────────────────────── */}
          <div className="card fade-in" style={{ border:'1px solid rgba(212,175,55,0.15)' }}>
            <h3 style={{ fontSize:'18px', marginBottom:'8px' }}>Contact Us Directly</h3>
            <p style={{ color:'var(--text-muted)', fontSize:'14px', marginBottom:'16px' }}>
              Have questions about booking? Reach us directly:
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'10px' }}>
              {contactInfo?.phone && (
                <a href={`tel:${contactInfo.phone}`} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background:'var(--surface2)', borderRadius:'var(--radius)', border:'1px solid var(--border)', textDecoration:'none', color:'var(--text)', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                  <span style={{ fontSize:'22px' }}></span>
                  <div><div style={{ fontSize:'11px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px' }}>Call</div><div style={{ fontWeight:700, fontSize:'15px' }}>{contactInfo.phone}</div></div>
                </a>
              )}
              {(contactInfo?.whatsapp || contactInfo?.phone) && (
                <a href={`https://wa.me/91${contactInfo.whatsapp||contactInfo.phone}`} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background:'var(--surface2)', borderRadius:'var(--radius)', border:'1px solid var(--border)', textDecoration:'none', color:'var(--text)', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#25D366'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                  <span style={{ fontSize:'22px' }}></span>
                  <div><div style={{ fontSize:'11px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px' }}>WhatsApp</div><div style={{ fontWeight:700, fontSize:'15px' }}>Chat Now</div></div>
                </a>
              )}
              {contactInfo?.email && (
                <a href={`mailto:${contactInfo.email}`}
                  style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background:'var(--surface2)', borderRadius:'var(--radius)', border:'1px solid var(--border)', textDecoration:'none', color:'var(--text)', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--info)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                  <span style={{ fontSize:'22px' }}></span>
                  <div><div style={{ fontSize:'11px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'1px' }}>Email</div><div style={{ fontWeight:700, fontSize:'14px' }}>{contactInfo.email}</div></div>
                </a>
              )}
            </div>
            {!contactInfo?.phone && !contactInfo?.email && !contactInfo?.whatsapp && (
              <div style={{ textAlign:'center', padding:'16px', color:'var(--text-muted)', fontSize:'14px' }}>
                {isOwner
                  ? <span>Add contact info in <Link to="/owner/about" style={{ color:'var(--gold)' }}>Owner Tools → About Us Editor → Contact & Social</Link></span>
                  : 'Contact information will appear here soon.'}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}