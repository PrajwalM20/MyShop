import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const SERVICES = [
  { id: 'passport', label: 'Passport Size Photo', icon: '🪪', price: 50 },
  { id: 'print_4x6', label: 'Print 4×6', icon: '🖼️', price: 50 },
  { id: 'print_a4', label: 'Print A4', icon: '📄', price: 30 },
  { id: 'lamination', label: 'Lamination', icon: '✨', price: 150 },
  { id: 'school_id', label: 'School ID Photo', icon: '🎓', price: 50 },
];

const STEPS = ['Your Info', 'Upload Photos', 'Service & Pay'];

export default function OrderPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    serviceType: 'passport', quantity: 1, notes: '',
  });

  const selectedService = SERVICES.find((s) => s.id === form.serviceType);
  const total = selectedService ? selectedService.price * form.quantity : 0;

  const onDrop = useCallback((accepted) => {
    setFiles((prev) => [...prev, ...accepted]);
    const newPreviews = accepted.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxFiles: 20,
    maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleInputChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.name || !form.email || !form.phone) { toast.error('Please fill all fields'); return false; }
      if (!/^\d{10}$/.test(form.phone)) { toast.error('Enter valid 10-digit phone number'); return false; }
      if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error('Enter valid email'); return false; }
    }
    if (step === 1) {
      if (files.length === 0) { toast.error('Please upload at least one photo'); return false; }
    }
    return true;
  };

  const initiateRazorpay = async () => {
    setLoading(true);
    try {
      // Create Razorpay order
      const { data: rpOrder } = await api.post('/payment/create-order', { amount: total });

      const options = {
        key: rpOrder.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'ClickQueue 📸',
        description: `${selectedService.label} × ${form.quantity}`,
        order_id: rpOrder.orderId,
        prefill: { name: form.name, email: form.email, contact: `+91${form.phone}` },
        theme: { color: '#D4AF37' },
        method: { upi: true, card: false, netbanking: false, wallet: true },
        handler: async (response) => {
          // Verify payment
          await api.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // Submit order with photos
          const formData = new FormData();
          Object.entries(form).forEach(([k, v]) => formData.append(k, v));
          formData.append('razorpayPaymentId', response.razorpay_payment_id);
          formData.append('razorpayOrderId', response.razorpay_order_id);
          files.forEach((f) => formData.append('photos', f));

          const { data: order } = await api.post('/orders/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          toast.success('🎉 Order placed successfully!');
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
      <div className="container" style={{ maxWidth: '720px' }}>

        {/* Header */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '40px', marginBottom: '8px' }}>Place Your <span className="text-gold">Order</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Fast, digital, no waiting in line</p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: i <= step ? 'var(--gold)' : 'var(--surface2)',
                  border: `2px solid ${i <= step ? 'var(--gold)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i <= step ? 'var(--black)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '14px',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '11px', color: i === step ? 'var(--gold)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: '2px', margin: '0 8px',
                  background: i < step ? 'var(--gold)' : 'var(--border)',
                  marginBottom: '18px', transition: 'all 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>

        <div className="card fade-in">

          {/* Step 0: Customer Info */}
          {step === 0 && (
            <div>
              <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Your Contact Information</h3>
              <div className="input-group">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleInputChange} placeholder="Enter your full name" />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleInputChange} placeholder="your@email.com" />
              </div>
              <div className="input-group">
                <label>Phone Number (for WhatsApp alerts)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <span style={{
                    background: 'var(--surface3)', border: '1px solid var(--border)',
                    borderRight: 'none', borderRadius: 'var(--radius) 0 0 var(--radius)',
                    padding: '12px 16px', color: 'var(--text-muted)', fontSize: '15px',
                  }}>+91</span>
                  <input
                    name="phone" value={form.phone} onChange={handleInputChange}
                    placeholder="10-digit mobile number" maxLength={10}
                    style={{ borderRadius: '0 var(--radius) var(--radius) 0', borderLeft: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Upload Photos */}
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Upload Your Photos</h3>
              <div
                {...getRootProps()}
                style={{
                  border: `2px dashed ${isDragActive ? 'var(--gold)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: isDragActive ? 'rgba(212,175,55,0.05)' : 'var(--surface2)',
                  transition: 'all 0.2s',
                }}>
                <input {...getInputProps()} />
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📤</div>
                <p style={{ fontSize: '16px', marginBottom: '6px' }}>
                  {isDragActive ? 'Drop your photos here!' : 'Drag & drop photos here'}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Or click to browse — JPG/PNG only, max 10MB each, up to 20 files
                </p>
              </div>

              {previews.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {previews.length} photo(s) selected
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          onClick={() => removeFile(i)}
                          style={{
                            position: 'absolute', top: '4px', right: '4px',
                            background: 'rgba(255,75,75,0.9)', border: 'none',
                            borderRadius: '50%', width: '22px', height: '22px',
                            color: '#fff', cursor: 'pointer', fontSize: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service & Pay */}
          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '24px', fontSize: '20px' }}>Select Service & Payment</h3>

              <div className="input-group">
                <label>Service Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {SERVICES.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setForm((f) => ({ ...f, serviceType: s.id }))}
                      style={{
                        padding: '14px 16px', borderRadius: 'var(--radius)',
                        border: `2px solid ${form.serviceType === s.id ? 'var(--gold)' : 'var(--border)'}`,
                        background: form.serviceType === s.id ? 'rgba(212,175,55,0.08)' : 'var(--surface2)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'all 0.2s',
                      }}>
                      <span style={{ fontSize: '22px' }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{s.label}</div>
                        <div style={{ fontSize: '13px', color: 'var(--gold)' }}>₹{s.price}/pc</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label>Quantity</label>
                <input
                  name="quantity" type="number" min={1} max={100}
                  value={form.quantity} onChange={handleInputChange}
                />
              </div>

              <div className="input-group">
                <label>Special Instructions (optional)</label>
                <textarea
                  name="notes" value={form.notes} onChange={handleInputChange}
                  placeholder="Any specific requirements..."
                  rows={3} style={{ resize: 'vertical' }}
                />
              </div>

              {/* Order Summary */}
              <div style={{
                background: 'var(--surface2)', borderRadius: 'var(--radius)',
                padding: '20px', marginBottom: '24px',
                border: '1px solid var(--border)',
              }}>
                <h4 style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{selectedService?.label}</span>
                  <span>₹{selectedService?.price} × {form.quantity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Photos uploaded</span>
                  <span>{files.length} file(s)</span>
                </div>
                <div className="divider" style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>Total Amount</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--gold)', fontWeight: 700 }}>₹{total}</span>
                </div>
              </div>

              {/* Payment icons */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pay via:</span>
                {['GPay', 'PhonePe', 'Paytm', 'UPI'].map((p) => (
                  <span key={p} style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '4px 10px', fontSize: '12px', fontWeight: 600,
                  }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', gap: '12px' }}>
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="btn btn-outline">← Back</button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              {step < 2 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => { if (validateStep()) setStep((s) => s + 1); }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={initiateRazorpay}
                  disabled={loading}
                  style={{ minWidth: '200px' }}
                >
                  {loading ? <span className="spinner" /> : `💳 Pay ₹${total} via UPI`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
    </div>
  );
}
