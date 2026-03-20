/**
 * OwnerFeedbackPage — imports feedback data from /api/feedback
 * Same data that clients submit via FeedbackPage and ConfirmationPage
 * No new schema — reuses existing feedbackRoutes.js completely
 */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];
const STAR_COLORS = ['', '#e74c3c', '#e67e22', '#f39c12', '#2ecc71', '#27ae60'];

function StarDisplay({ rating, size = 18 }) {
  return (
    <span style={{ fontSize: size, lineHeight: 1 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ filter: s <= rating ? 'none' : 'grayscale(1) opacity(0.2)' }}>⭐</span>
      ))}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}18`, fontSize: '22px' }}>{icon}</div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function OwnerFeedbackPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all'); // all | 5 | 4 | 3 | 2 | 1

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      // Reuse existing GET /api/feedback endpoint from feedbackRoutes.js
      const { data } = await api.get('/feedback');
      setFeedbacks(data);
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  // ── Computed stats from existing feedback data ─────────────
  const total       = feedbacks.length;
  const avgRating   = total > 0 ? (feedbacks.reduce((s,f) => s + f.rating, 0) / total).toFixed(1) : '—';
  const ratingCounts = [0,0,0,0,0,0]; // index 1-5
  feedbacks.forEach(f => { if (f.rating >= 1 && f.rating <= 5) ratingCounts[f.rating]++; });
  const fiveStarPct = total > 0 ? Math.round((ratingCounts[5] / total) * 100) : 0;

  // All unique tags across all feedback
  const tagCounts = {};
  feedbacks.forEach(f => (f.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);

  const filtered = filter === 'all' ? feedbacks : feedbacks.filter(f => f.rating === parseInt(filter));

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" style={{ width:'48px', height:'48px' }} />
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '960px' }}>

        {/* Header */}
        <div className="fade-in" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontSize:'34px', marginBottom:'6px' }}>
              ⭐ Customer <span className="text-gold">Feedback</span>
            </h1>
            <p style={{ color:'var(--text-muted)', fontSize:'15px' }}>
              All feedback submitted by clients — from orders and the feedback page
            </p>
          </div>
          <button onClick={loadFeedback} className="btn btn-outline btn-sm">🔄 Refresh</button>
        </div>

        {total === 0 ? (
          <div className="card fade-in" style={{ textAlign:'center', padding:'64px 32px' }}>
            <div style={{ fontSize:'56px', marginBottom:'16px' }}>⭐</div>
            <h3 style={{ fontSize:'22px', marginBottom:'8px' }}>No feedback yet</h3>
            <p style={{ color:'var(--text-muted)', fontSize:'15px', marginBottom:'24px' }}>
              Feedback will appear here after clients submit it from their orders or the feedback page.
            </p>
            <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/feedback" className="btn btn-outline btn-sm">View Client Feedback Page</Link>
            </div>
          </div>
        ) : (
          <>
            {/* ── STATS ROW ─────────────────────────────────── */}
            <div className="grid-4 fade-in" style={{ marginBottom:'28px', gap:'16px' }}>
              <StatCard icon="⭐" label="Average Rating" value={avgRating} sub={`out of 5`} color="var(--gold)" />
              <StatCard icon="💬" label="Total Reviews"  value={total}     sub="all time"  color="var(--info)" />
              <StatCard icon="🏆" label="5-Star Reviews" value={`${fiveStarPct}%`} sub={`${ratingCounts[5]} reviews`} color="var(--success)" />
              <StatCard icon="📅" label="Latest"         value={feedbacks[0] ? new Date(feedbacks[0].createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '—'} sub="most recent" color="var(--text-muted)" />
            </div>

            {/* ── RATING BREAKDOWN ──────────────────────────── */}
            <div className="card fade-in" style={{ marginBottom:'24px' }}>
              <h3 style={{ fontSize:'17px', marginBottom:'16px' }}>Rating Breakdown</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[5,4,3,2,1].map(star => {
                  const count = ratingCounts[star];
                  const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={star} style={{ display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' }}
                      onClick={() => setFilter(filter === String(star) ? 'all' : String(star))}>
                      <div style={{ display:'flex', alignItems:'center', gap:'4px', minWidth:'80px' }}>
                        <span style={{ fontSize:'16px' }}>⭐</span>
                        <span style={{ fontSize:'14px', fontWeight:600, color: filter === String(star) ? 'var(--gold)' : 'var(--text)' }}>{star} star</span>
                      </div>
                      <div style={{ flex:1, height:'10px', background:'var(--surface2)', borderRadius:'100px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background: STAR_COLORS[star], borderRadius:'100px', transition:'width 0.5s ease' }} />
                      </div>
                      <div style={{ minWidth:'48px', textAlign:'right', fontSize:'13px', color:'var(--text-muted)' }}>{count} ({pct}%)</div>
                    </div>
                  );
                })}
              </div>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} style={{ marginTop:'12px', background:'none', border:'none', color:'var(--gold)', cursor:'pointer', fontSize:'13px', padding:0 }}>
                  ← Show all ratings
                </button>
              )}
            </div>

            {/* ── TOP TAGS ──────────────────────────────────── */}
            {topTags.length > 0 && (
              <div className="card fade-in" style={{ marginBottom:'24px' }}>
                <h3 style={{ fontSize:'17px', marginBottom:'14px' }}>Most Mentioned</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {topTags.map(([tag, count]) => (
                    <div key={tag} style={{ padding:'6px 14px', borderRadius:'100px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', fontSize:'13px', fontWeight:600, color:'var(--gold)' }}>
                      {tag} <span style={{ color:'var(--text-muted)', fontWeight:400 }}>× {count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── INDIVIDUAL REVIEWS ────────────────────────── */}
            <div className="fade-in">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
                <h3 style={{ fontSize:'17px' }}>
                  {filter === 'all' ? `All Reviews (${total})` : `${filter}-Star Reviews (${filtered.length})`}
                </h3>
              </div>

              {filtered.length === 0 ? (
                <div className="card" style={{ textAlign:'center', padding:'32px', color:'var(--text-muted)' }}>
                  No {filter}-star reviews yet
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  {filtered.map((fb, i) => (
                    <div key={fb._id || i} className="card fade-in" style={{
                      border: `1px solid ${fb.rating === 5 ? 'rgba(45,216,130,0.2)' : fb.rating <= 2 ? 'rgba(255,75,75,0.2)' : 'var(--border)'}`,
                      padding:'18px 20px',
                      animationDelay: `${i * 0.04}s`,
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px', flexWrap:'wrap', gap:'8px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                          <StarDisplay rating={fb.rating} size={16} />
                          <span style={{ fontWeight:700, fontSize:'15px', color: STAR_COLORS[fb.rating] }}>
                            {STAR_LABELS[fb.rating]}
                          </span>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                          {fb.orderId && fb.orderId !== 'general' && (
                            <span style={{ fontSize:'12px', color:'var(--text-muted)', fontFamily:'monospace' }}>
                              {fb.orderId}
                            </span>
                          )}
                          <span style={{ fontSize:'12px', color:'var(--text-muted)' }}>
                            {new Date(fb.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                        </div>
                      </div>

                      {fb.tags && fb.tags.length > 0 && (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px' }}>
                          {fb.tags.map(tag => (
                            <span key={tag} style={{ padding:'3px 10px', borderRadius:'100px', background:'var(--surface2)', border:'1px solid var(--border)', fontSize:'12px', color:'var(--text-muted)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {fb.comment && (
                        <p style={{ color:'var(--text-muted)', fontSize:'14px', lineHeight:1.7, margin:0, fontStyle:'italic' }}>
                          "{fb.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}