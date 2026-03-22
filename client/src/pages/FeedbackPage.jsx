import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STARS = [1, 2, 3, 4, 5];

const FEEDBACK_TAGS = [
  'Friendly Staff',
  'Fast Service',
  'Great Quality',
  'Easy to Order',
  'Good Prices',
  'Clear Instructions',
  'Quick Notification',
  'Will Visit Again',
];

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

export default function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const prefillOrderId = searchParams.get('order') || '';

  const [orderId,    setOrderId]    = useState(prefillOrderId);
  const [rating,     setRating]     = useState(0);
  const [hover,      setHover]      = useState(0);
  const [tags,       setTags]       = useState([]);
  const [comment,    setComment]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const toggleTag = (tag) =>
    setTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/feedback', {
        orderId: orderId.trim() || 'general',
        rating,
        tags,
        comment,
      });
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── SUCCESS STATE ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '520px', textAlign: 'center' }}>
          <div className="card fade-in" style={{ padding: '48px 32px', border: '1px solid rgba(45,216,130,0.3)', background: 'rgba(45,216,130,0.04)' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '10px', color: 'var(--success)' }}>Thank You!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.8, marginBottom: '8px' }}>
              Your {rating}-star feedback has been recorded.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
              It helps us serve you better every time. We appreciate your trust in <strong style={{ color: 'var(--gold)' }}>Usha Photo Studio</strong>.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="btn btn-outline">Home</Link>
              <Link to="/order" className="btn btn-primary">Place New Order</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '580px' }}>

        {/* Header */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '100px', padding: '6px 20px', fontSize: '14px',
            color: 'var(--gold)', marginBottom: '20px',
          }}>
            Share Your Experience
          </div>
          <h1 style={{ fontSize: 'clamp(28px,6vw,40px)', marginBottom: '10px' }}>
            Your <span className="text-gold">Feedback</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.7 }}>
            How was your experience with us? Your feedback helps us improve.
          </p>
        </div>

        <div className="card fade-in">

          {/* Order ID (optional) */}
          <div className="input-group">
            <label>
              Order ID
              <span style={{ marginLeft: '8px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', fontSize: '11px', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                Optional
              </span>
            </label>
            <input
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. CQ-XXXXXXXX  (leave blank for general feedback)"
            />
          </div>

          {/* Star Rating */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              Overall Rating <span style={{ color: 'var(--danger)' }}>*</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
              {STARS.map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '44px', lineHeight: 1, padding: '4px',
                    filter: (hover || rating) >= star ? 'none' : 'grayscale(1) opacity(0.25)',
                    transform: (hover || rating) >= star ? 'scale(1.18)' : 'scale(1)',
                    transition: 'all 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >⭐</button>
              ))}
            </div>

            {(hover || rating) > 0 && (
              <div style={{
                textAlign: 'center', fontWeight: 700, fontSize: '18px',
                color: 'var(--gold)', minHeight: '24px', transition: 'all 0.15s',
              }}>
                {STAR_LABELS[hover || rating]}
              </div>
            )}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              What did you like? (optional)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {FEEDBACK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: '8px 16px', borderRadius: '100px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: tags.includes(tag) ? 700 : 400,
                    background: tags.includes(tag) ? 'var(--gold)' : 'var(--surface2)',
                    color: tags.includes(tag) ? 'var(--black)' : 'var(--text-muted)',
                    border: `1px solid ${tags.includes(tag) ? 'var(--gold)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >{tag}</button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="input-group">
            <label>
              Additional Comments
              <span style={{ marginLeft: '8px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', fontSize: '11px', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>
                Optional
              </span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us more about your experience — what went well, what could be better..."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={submitting || rating === 0}
            style={{ width: '100%', fontSize: '16px', padding: '16px' }}
          >
            {submitting ? <span className="spinner" /> : 'Submit Feedback'}
          </button>

          {rating === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '10px' }}>
              Please select a star rating to submit
            </p>
          )}
        </div>

        {/* Back links */}
        <div style={{ textAlign: 'center', marginTop: '24px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>← Back to Home</Link>
          <Link to="/track" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track Order</Link>
        </div>

      </div>
    </div>
  );
}