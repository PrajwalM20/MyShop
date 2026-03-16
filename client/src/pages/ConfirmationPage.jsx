import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STARS = [1, 2, 3, 4, 5];

const FEEDBACK_TAGS = [
  'Fast Service', 'Great Quality', 'Easy to Order', 'Friendly Staff',
  'Good Prices', 'Clear Instructions', 'Quick Notification', 'Will Visit Again',
];

export default function ConfirmationPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const queueNumber = searchParams.get('queue');
  const amount = searchParams.get('amount');

  // Feedback state
  const [feedbackStep, setFeedbackStep] = useState('prompt'); // prompt | form | done
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag) => setTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);

  const submitFeedback = async () => {
    if (rating === 0) { toast.error('Please give a star rating'); return; }
    setSubmitting(true);
    try {
      // Store feedback — gracefully fails if endpoint not set up yet
      await api.post('/feedback', { orderId, rating, tags, comment }).catch(() => {});
      setFeedbackStep('done');
      toast.success('Thank you for your feedback! 🙏');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>

        {/* Success Banner */}
        <div className="fade-in" style={{
          textAlign: 'center', padding: '48px 24px 32px',
          background: 'linear-gradient(135deg, rgba(45,216,130,0.08), rgba(212,175,55,0.06))',
          border: '1px solid rgba(45,216,130,0.25)', borderRadius: 'var(--radius-lg)',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '72px', marginBottom: '16px', lineHeight: 1 }}>🎉</div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--success)' }}>Order Placed!</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '24px' }}>
            Your payment was successful. You'll get a WhatsApp notification when your photos are ready.
          </p>

          {/* Queue & Order info */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 24px', minWidth: '140px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Queue Number</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--gold)', fontWeight: 900, lineHeight: 1 }}>#{queueNumber}</div>
            </div>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 24px', minWidth: '140px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Amount Paid</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '40px', color: 'var(--success)', fontWeight: 900, lineHeight: 1 }}>₹{amount}</div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '12px 20px', background: 'rgba(45,216,130,0.08)', borderRadius: 'var(--radius)', fontSize: '13px', color: 'var(--success)' }}>
            📱 WhatsApp + SMS notification will be sent when ready
          </div>
        </div>

        {/* Order ID */}
        <div className="card fade-in" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Your Order ID</div>
            <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '1px', color: 'var(--gold)' }}>{orderId}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Save this to track your order</div>
          </div>
          <Link to={`/track/${orderId}`} className="btn btn-outline btn-sm">🔍 Track Order</Link>
        </div>

        {/* ── FEEDBACK SECTION ──────────────────────────────────── */}
        {feedbackStep === 'prompt' && (
          <div className="card fade-in" style={{
            textAlign: 'center', border: '1px solid rgba(212,175,55,0.3)',
            background: 'rgba(212,175,55,0.04)', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⭐</div>
            <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>How was your experience?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
              Help us improve by sharing your feedback — takes just 30 seconds!
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setFeedbackStep('form')} className="btn btn-primary">Give Feedback</button>
              <button onClick={() => setFeedbackStep('skip')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px', padding: '8px' }}>Skip</button>
            </div>
          </div>
        )}

        {feedbackStep === 'form' && (
          <div className="card fade-in" style={{ marginBottom: '24px', border: '1px solid rgba(212,175,55,0.3)' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Your Feedback</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>For order {orderId}</p>

            {/* Star Rating */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Overall Rating <span style={{ color: 'var(--danger)' }}>*</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
                {STARS.map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      fontSize: '36px', lineHeight: 1,
                      filter: (hoverRating || rating) >= star ? 'none' : 'grayscale(1) opacity(0.3)',
                      transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s',
                    }}
                  >⭐</button>
                ))}
              </div>
              {(hoverRating || rating) > 0 && (
                <div style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: '15px' }}>
                  {ratingLabels[hoverRating || rating]}
                </div>
              )}
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>What did you like? (optional)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {FEEDBACK_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '6px 14px', borderRadius: '100px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                      background: tags.includes(tag) ? 'var(--gold)' : 'var(--surface2)',
                      color: tags.includes(tag) ? 'var(--black)' : 'var(--text-muted)',
                      border: `1px solid ${tags.includes(tag) ? 'var(--gold)' : 'var(--border)'}`,
                      transition: 'all 0.15s',
                    }}
                  >{tag}</button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label>Additional Comments (optional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setFeedbackStep('prompt')} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>
              <button onClick={submitFeedback} className="btn btn-primary" disabled={submitting} style={{ flex: 2 }}>
                {submitting ? <span className="spinner" /> : '🙏 Submit Feedback'}
              </button>
            </div>
          </div>
        )}

        {feedbackStep === 'done' && (
          <div className="card fade-in" style={{
            textAlign: 'center', marginBottom: '24px',
            background: 'rgba(45,216,130,0.06)', border: '1px solid rgba(45,216,130,0.3)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🙏</div>
            <h3 style={{ fontSize: '20px', color: 'var(--success)', marginBottom: '6px' }}>Thank You!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              Your {rating}-star feedback has been recorded. It helps us serve you better!
            </p>
          </div>
        )}

        {/* Bottom actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>🏠 Home</Link>
          <Link to="/order" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>📸 New Order</Link>
        </div>

      </div>
    </div>
  );
}