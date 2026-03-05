import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const STEPS = ['Your Info', 'Upload Photos', 'Select Services', 'Review & Pay'];

export default function OrderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Customer info
  const [info, setInfo] = useState({ name: '', email: '', phone: '', notes: '' });

  // Cart: array of { serviceType, serviceLabel, quantity, pricePerUnit, copies, unit, note, photoIndexes[], priceTBD }
  const [cart, setCart] = useState([]);

  // Per-service photo assignment modal
  const [assignModal, setAssignModal] = useState(null); // { cartIndex }

  useEffect(() => {
    api.get('/settings/services')
      .then(({ data }) => setAllServices(data))
      .catch(() => toast.error('Failed to load services'));
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);

  // ── Dropzone ──────────────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    setFiles(prev => [...prev, ...accepted]);
    setPreviews(prev => [...prev, ...accepted.map(f => URL.createObjectURL(f))]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [] }, maxFiles: 30, maxSize: 10 * 1024 * 1024,
  });
  const removeFile = (i) => {
    setFiles(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
    // Remove this index from all cart items
    setCart(c => c.map(item => ({
      ...item,
      photoIndexes: item.photoIndexes.filter(pi => pi !== i).map(pi => pi > i ? pi - 1 : pi),
    })));
  };

  // ── Cart helpers ───────────────────────────────────────────────
  const isInCart = (serviceId) => cart.some(c => c.serviceType === serviceId);

  const addToCart = (svc) => {
    if (isInCart(svc.id)) return;
    setCart(c => [...c, {
      serviceType: svc.id,
      serviceLabel: svc.label,
      quantity: 1,
      pricePerUnit: svc.price,
      copies: svc.copies || 1,
      unit: svc.unit || 'piece',
      note: '',
      photoIndexes: [],
      priceTBD: svc.priceTBD || false,
      icon: svc.icon,
    }]);
    toast.success(`${svc.label} added!`, { duration: 1200 });
  };

  const removeFromCart = (serviceType) => {
    setCart(c => c.filter(item => item.serviceType !== serviceType));
  };

  const updateCartItem = (serviceType, field, value) => {
    setCart(c => c.map(item =>
      item.serviceType === serviceType ? { ...item, [field]: value } : item
    ));
  };

  // ── Validation ─────────────────────────────────────────────────
  const validate = () => {
    if (step === 0) {
      if (!info.name.trim())     { toast.error('Please enter your name'); return false; }
      if (!info.phone.trim())    { toast.error('Please enter phone number'); return false; }
      if (!/^\d{10}$/.test(info.phone)) { toast.error('Enter valid 10-digit phone'); return false; }
      if (info.email && !/\S+@\S+\.\S+/.test(info.email)) { toast.error('Enter valid email'); return false; }
    }
    if (step === 1 && files.length === 0) { toast.error('Upload at least one photo'); return false; }
    if (step === 2) {
      if (cart.length === 0) { toast.error('Please select at least one service'); return false; }
      const hasTBD = cart.some(i => i.priceTBD);
      if (hasTBD) { toast.error('Please remove services with price TBD or contact owner'); return false; }
    }
    return true;
  };

  // ── Payment ────────────────────────────────────────────────────
  const initiatePayment = async () => {
    setLoading(true);
    try {
      const { data: rpOrder } = await api.post('/payment/create-order', { amount: totalAmount });
      const options = {
        key: rpOrder.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'Usha Photo Studio 📸',
        description: cart.map(i => i.serviceLabel).join(', '),
        order_id: rpOrder.orderId,
        prefill: { name: info.name, email: info.email || '', contact: `+91${info.phone}` },
        theme: { color: '#D4AF37' },
        method: { upi: true, card: false, netbanking: false, wallet: true },
        handler: async (response) => {
          await api.post('/payment/verify', {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });

          const formData = new FormData();
          formData.append('name',  info.name);
          formData.append('email', info.email || '');
          formData.append('phone', info.phone);
          formData.append('notes', info.notes || '');
          formData.append('razorpayPaymentId', response.razorpay_payment_id);
          formData.append('razorpayOrderId',   response.razorpay_order_id);
          formData.append('items', JSON.stringify(cart));
          files.forEach(f => formData.append('photos', f));

          const { data: order } = await api.post('/orders/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          toast.success('🎉 Order placed!');
          navigate(`/confirmation/${order.orderId}?queue=${order.queueNumber}&amount=${order.totalAmount}`);
        },
        modal: { ondismiss: () => { setLoading(false); toast.error('Payment cancelled'); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '760px' }}>

        {/* Header */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '38px', marginBottom: '6px' }}>
            Place Your <span className="text-gold">Order</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Fast, digital, no queue</p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '36px' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: i <= step ? 'var(--gold)' : 'var(--surface2)',
                  border: `2px solid ${i <= step ? 'var(--gold)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i <= step ? 'var(--black)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '13px', transition: 'all 0.3s',
                }}>{i < step ? '✓' : i + 1}</div>
                <span style={{ fontSize: '10px', color: i === step ? 'var(--gold)' : 'var(--text-muted)', whiteSpace: 'nowrap', textAlign: 'center' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '2px', margin: '0 6px', marginBottom: '16px', background: i < step ? 'var(--gold)' : 'var(--border)', transition: 'all 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        <div className="card fade-in">

          {/* ── STEP 0: Info ────────────────────────────────────── */}
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Your Contact Info</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>Phone required · Email optional</p>

              <div className="input-group">
                <label>Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input value={info.name} onChange={e => setInfo(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
              </div>

              <div className="input-group">
                <label>
                  Phone <span style={{ color: 'var(--danger)' }}>*</span>
                  <span style={{ marginLeft: '8px', background: 'rgba(45,216,130,0.1)', color: 'var(--success)', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                    WhatsApp alerts
                  </span>
                </label>
                <div style={{ display: 'flex' }}>
                  <span style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRight: 'none', borderRadius: 'var(--radius) 0 0 var(--radius)', padding: '12px 14px', color: 'var(--text-muted)', fontSize: '14px' }}>+91</span>
                  <input value={info.phone} onChange={e => setInfo(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile" maxLength={10} style={{ borderRadius: '0 var(--radius) var(--radius) 0', borderLeft: 'none' }} />
                </div>
              </div>

              <div className="input-group">
                <label>Email
                  <span style={{ marginLeft: '8px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>Optional</span>
                </label>
                <input type="email" value={info.email} onChange={e => setInfo(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📱 No email? We'll notify you via WhatsApp!</span>
              </div>
            </div>
          )}

          {/* ── STEP 1: Photos ──────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Upload Your Photos</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                Upload all photos first. You can assign which photo belongs to which service in the next step.
              </p>

              <div {...getRootProps()} style={{
                border: `2px dashed ${isDragActive ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center',
                cursor: 'pointer', background: isDragActive ? 'rgba(212,175,55,0.05)' : 'var(--surface2)', transition: 'all 0.2s',
              }}>
                <input {...getInputProps()} />
                <div style={{ fontSize: '44px', marginBottom: '10px' }}>📤</div>
                <p style={{ fontSize: '15px', marginBottom: '4px' }}>{isDragActive ? 'Drop here!' : 'Drag & drop photos here'}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>or tap to browse · JPG/PNG · max 10MB · up to 30 files</p>
              </div>

              {previews.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    {previews.length} photo(s) uploaded
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border)' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '4px', fontSize: '10px', padding: '1px 5px' }}>P{i + 1}</div>
                        <button onClick={() => removeFile(i)} style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(255,75,75,0.9)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', color: '#fff', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Select Services ──────────────────────────── */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '6px' }}>Select Services</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                Tap a service to add it to your order. You can select multiple!
              </p>

              {/* Service grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginBottom: '28px' }}>
                {allServices.map(svc => {
                  const inCart = isInCart(svc.id);
                  return (
                    <div key={svc.id} onClick={() => inCart ? removeFromCart(svc.id) : addToCart(svc)}
                      style={{
                        padding: '16px', borderRadius: 'var(--radius)',
                        border: `2px solid ${inCart ? 'var(--gold)' : 'var(--border)'}`,
                        background: inCart ? 'rgba(212,175,55,0.08)' : 'var(--surface2)',
                        cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                      }}>
                      {inCart && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--gold)', color: 'var(--black)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>✓</div>
                      )}
                      <div style={{ fontSize: '28px', marginBottom: '6px' }}>{svc.icon}</div>
                      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '3px' }}>{svc.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{svc.desc}</div>
                      {svc.priceTBD ? (
                        <div style={{ color: 'var(--warning)', fontSize: '13px', fontWeight: 700 }}>Price TBD</div>
                      ) : (
                        <div style={{ color: 'var(--gold)', fontSize: '16px', fontWeight: 700 }}>
                          ₹{svc.price}
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 400 }}> / {svc.unit}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cart — configure each selected service */}
              {cart.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--gold)' }}>
                    🛒 Your Selection ({cart.length} service{cart.length > 1 ? 's' : ''})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {cart.map((item, idx) => (
                      <div key={item.serviceType} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '22px' }}>{item.icon}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.serviceLabel}</div>
                              {!item.priceTBD && (
                                <div style={{ fontSize: '12px', color: 'var(--gold)' }}>
                                  ₹{item.pricePerUnit} / {item.unit}
                                  {item.copies > 1 && <span style={{ color: 'var(--text-muted)' }}> · {item.copies} copies per {item.unit}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(item.serviceType)} style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.3)', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: 'var(--danger)', fontSize: '12px' }}>Remove</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {/* Quantity */}
                          <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '11px' }}>Quantity ({item.unit}s)</label>
                            <input type="number" min={1} max={50} value={item.quantity}
                              onChange={e => updateCartItem(item.serviceType, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                              style={{ fontSize: '16px', fontWeight: 700 }} />
                          </div>

                          {/* Photo assignment */}
                          <div className="input-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '11px' }}>Which photo(s)?</label>
                            <button onClick={() => setAssignModal(idx)} style={{
                              background: item.photoIndexes.length > 0 ? 'rgba(212,175,55,0.1)' : 'var(--surface3)',
                              border: `1px solid ${item.photoIndexes.length > 0 ? 'var(--gold)' : 'var(--border)'}`,
                              borderRadius: 'var(--radius)', padding: '10px 12px', cursor: 'pointer',
                              color: item.photoIndexes.length > 0 ? 'var(--gold)' : 'var(--text-muted)',
                              fontSize: '12px', fontWeight: 600, textAlign: 'left',
                            }}>
                              {item.photoIndexes.length > 0
                                ? `📷 Photo ${item.photoIndexes.map(i => i + 1).join(', ')}`
                                : '📷 Assign photos'}
                            </button>
                          </div>
                        </div>

                        {/* Special note for this service */}
                        <div className="input-group" style={{ margin: '10px 0 0' }}>
                          <label style={{ fontSize: '11px' }}>Note for this service (optional)</label>
                          <input value={item.note} onChange={e => updateCartItem(item.serviceType, 'note', e.target.value)}
                            placeholder={item.serviceType === 'flex' ? 'Enter size e.g. 3ft × 4ft' : 'Any special requirement...'}
                            style={{ fontSize: '13px' }} />
                        </div>

                        {/* Subtotal */}
                        {!item.priceTBD && (
                          <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                            ₹{item.pricePerUnit} × {item.quantity} = <strong style={{ color: 'var(--gold)', fontSize: '16px' }}>₹{item.pricePerUnit * item.quantity}</strong>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Grand total */}
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Total Amount</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--gold)', fontWeight: 700 }}>₹{totalAmount}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Review & Pay ─────────────────────────────── */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Review & Pay</h3>

              {/* Customer */}
              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Customer</div>
                <div style={{ fontWeight: 700 }}>{info.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>📞 +91 {info.phone}</div>
                {info.email && <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>✉️ {info.email}</div>}
                <div style={{ color: 'var(--success)', fontSize: '12px', marginTop: '6px' }}>
                  🔔 {info.email ? 'WhatsApp + SMS + Email' : 'WhatsApp + SMS'} notification when ready
                </div>
              </div>

              {/* Photos */}
              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Photos ({files.length})</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {previews.slice(0, 8).map((src, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={src} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                      <div style={{ position: 'absolute', bottom: '1px', left: '1px', background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '3px', fontSize: '9px', padding: '1px 3px' }}>P{i + 1}</div>
                    </div>
                  ))}
                  {previews.length > 8 && <div style={{ width: '48px', height: '48px', background: 'var(--surface3)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>+{previews.length - 8}</div>}
                </div>
              </div>

              {/* Order items */}
              <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '16px', marginBottom: '16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Order Items</div>
                {cart.map((item, i) => (
                  <div key={item.serviceType} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < cart.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <span style={{ fontSize: '16px', marginRight: '8px' }}>{item.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{item.serviceLabel}</span>
                      {item.copies > 1 && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}> ({item.copies} copies/{item.unit})</span>}
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}> × {item.quantity}</span>
                      {item.photoIndexes.length > 0 && <div style={{ fontSize: '11px', color: 'var(--gold)', marginTop: '2px' }}>📷 Photo {item.photoIndexes.map(i => i + 1).join(', ')}</div>}
                      {item.note && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>📝 {item.note}</div>}
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--gold)' }}>₹{item.pricePerUnit * item.quantity}</span>
                  </div>
                ))}
                <div className="divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--gold)', fontWeight: 700 }}>₹{totalAmount}</span>
                </div>
              </div>

              {/* Pay via */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pay via:</span>
                {['GPay', 'PhonePe', 'Paytm', 'UPI'].map(p => (
                  <span key={p} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 600 }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px' }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn btn-outline">← Back</button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              {step < 3 ? (
                <button className="btn btn-primary" onClick={() => { if (validate()) setStep(s => s + 1); }}>
                  Continue →
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={initiatePayment} disabled={loading || totalAmount === 0} style={{ minWidth: '200px' }}>
                  {loading ? <span className="spinner" /> : `💳 Pay ₹${totalAmount} via UPI`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PHOTO ASSIGN MODAL ──────────────────────────────────── */}
      {assignModal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '24px' }}
          onClick={() => setAssignModal(null)}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px' }}>
                  {cart[assignModal]?.icon} {cart[assignModal]?.serviceLabel}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  Select which photos to use for this service
                </p>
              </div>
              <button onClick={() => setAssignModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>

            {previews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No photos uploaded yet</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                {previews.map((src, i) => {
                  const isSelected = cart[assignModal]?.photoIndexes.includes(i);
                  return (
                    <div key={i} onClick={() => {
                      const item = cart[assignModal];
                      const newIndexes = isSelected
                        ? item.photoIndexes.filter(pi => pi !== i)
                        : [...item.photoIndexes, i];
                      updateCartItem(item.serviceType, 'photoIndexes', newIndexes);
                    }} style={{
                      position: 'relative', aspectRatio: '1', borderRadius: '10px',
                      overflow: 'hidden', cursor: 'pointer',
                      border: `3px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '3px', left: '3px', background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: '4px', fontSize: '10px', padding: '1px 5px' }}>P{i + 1}</div>
                      {isSelected && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(212,175,55,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ background: 'var(--gold)', color: 'var(--black)', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>✓</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => {
                const item = cart[assignModal];
                updateCartItem(item.serviceType, 'photoIndexes', previews.map((_, i) => i));
              }} className="btn btn-sm btn-outline" style={{ flex: 1 }}>Select All</button>
              <button onClick={() => {
                const item = cart[assignModal];
                updateCartItem(item.serviceType, 'photoIndexes', []);
              }} className="btn btn-sm btn-outline" style={{ flex: 1 }}>Clear</button>
              <button onClick={() => setAssignModal(null)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>Done ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}