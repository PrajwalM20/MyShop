import { useState, useEffect } from 'react';
import api from '../utils/api';

const CATEGORIES = [
  { id: 'all',       label: 'All Work' },
  { id: 'passport',  label: 'Passport Photos' },
  { id: 'print',     label: 'Prints' },
  { id: 'school_id', label: 'School ID' },
  { id: 'wedding',   label: 'Wedding' },
  { id: 'event',     label: 'Events' },
  { id: 'other',     label: 'Other' },
];

// ── Copyright watermark overlay ───────────────────────────────
const COPYRIGHT_TEXT = '© Usha Photo Studio';

// Blocks right-click on image elements
const blockRightClick = (e) => e.preventDefault();
const blockDrag       = (e) => e.preventDefault();

export default function PortfolioPage() {
  const [items,    setItems]    = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadPortfolio(); }, [filter]);

  // Disable right-click globally on this page
  useEffect(() => {
    document.addEventListener('contextmenu', blockRightClick);
    document.addEventListener('dragstart',   blockDrag);
    return () => {
      document.removeEventListener('contextmenu', blockRightClick);
      document.removeEventListener('dragstart',   blockDrag);
    };
  }, []);

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/portfolio?category=${filter}`);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div className="container">

        {/* Header */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '100px', padding: '6px 16px', fontSize: '13px',
            color: 'var(--gold)', marginBottom: '16px',
          }}>
            ✨ Our Work
          </div>
          <h1 style={{ fontSize: '48px', marginBottom: '12px' }}>
            Work We've <span className="text-gold">Done</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px', margin: '0 auto 8px' }}>
            Browse our portfolio of professional photo services
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', opacity: 0.6 }}>
             All images are copyright protected — {COPYRIGHT_TEXT}
          </p>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)} className="btn btn-sm" style={{
              background: filter === c.id ? 'var(--gold)' : 'var(--surface)',
              color: filter === c.id ? 'var(--black)' : 'var(--text-muted)',
              border: `1px solid ${filter === c.id ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: '100px',
            }}>{c.label}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <p>No portfolio items yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {items.map((item, i) => (
              <div
                key={item._id}
                className="fade-in"
                style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}
                onClick={() => setSelected(item)}
              >
                <div style={{
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  transition: 'all 0.25s ease',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--gold)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(212,175,55,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  {/* ── Protected image container ── */}
                  <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      draggable={false}
                      onContextMenu={e => e.preventDefault()}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                        pointerEvents: 'none', // blocks direct image interaction
                      }}
                    />

                    {/* ── Transparent interaction blocker ── */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      zIndex: 2,
                      background: 'transparent',
                    }} onContextMenu={e => e.preventDefault()} />

                    {/* ── Visible watermark ── */}
                    <div style={{
                      position: 'absolute', bottom: '8px', right: '8px',
                      zIndex: 3,
                      background: 'rgba(0,0,0,0.55)',
                      color: 'rgba(255,255,255,0.85)',
                      fontSize: '10px', fontWeight: 600,
                      padding: '3px 8px', borderRadius: '4px',
                      letterSpacing: '0.5px',
                      backdropFilter: 'blur(4px)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}>
                      © Usha Photo Studio
                    </div>

                    {/* ── Corner badges ── */}
                    {item.featured && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px', zIndex: 3,
                        background: 'var(--gold)', color: 'var(--black)',
                        borderRadius: '100px', padding: '3px 10px',
                        fontSize: '11px', fontWeight: 700, pointerEvents: 'none',
                      }}>⭐ Featured</div>
                    )}
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px', zIndex: 3,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      borderRadius: '100px', padding: '3px 10px',
                      fontSize: '11px', textTransform: 'capitalize',
                      backdropFilter: 'blur(4px)', pointerEvents: 'none',
                    }}>{item.category}</div>
                  </div>

                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>{item.title}</h3>
                    {item.description && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Lightbox with watermark ── */}
        {selected && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 300, padding: '24px',
            }}
            onClick={() => setSelected(null)}
            onContextMenu={e => e.preventDefault()}
          >
            <div style={{ maxWidth: '800px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>

              {/* Image with no interaction */}
              <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <img
                  src={selected.imageUrl}
                  alt={selected.title}
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                  style={{
                    width: '100%', maxHeight: '70vh',
                    objectFit: 'contain',
                    display: 'block',
                    pointerEvents: 'none',
                  }}
                />

                {/* Lightbox interaction blocker */}
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 2,
                  background: 'transparent',
                }} onContextMenu={e => e.preventDefault()} />

                {/* Lightbox watermark — center diagonal */}
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    color: 'rgba(255,255,255,0.12)',
                    fontSize: '22px', fontWeight: 700,
                    letterSpacing: '3px', textTransform: 'uppercase',
                    transform: 'rotate(-30deg)',
                    whiteSpace: 'nowrap',
                    fontFamily: 'serif',
                  }}>
                    © Usha Photo Studio
                  </div>
                </div>

                {/* Lightbox corner watermark */}
                <div style={{
                  position: 'absolute', bottom: '12px', right: '12px', zIndex: 4,
                  background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.9)',
                  fontSize: '12px', fontWeight: 600, padding: '4px 10px',
                  borderRadius: '4px', letterSpacing: '0.5px',
                  backdropFilter: 'blur(4px)', pointerEvents: 'none',
                }}>
                  © Usha Photo Studio
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{selected.title}</h2>
                {selected.description && <p style={{ color: 'var(--text-muted)' }}>{selected.description}</p>}
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>
                   This image is protected by copyright — {COPYRIGHT_TEXT}
                </p>
                <button onClick={() => setSelected(null)} className="btn btn-outline" style={{ marginTop: '16px' }}>✕ Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Copyright footer note */}
        <div style={{ textAlign: 'center', marginTop: '48px', padding: '20px', borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.7 }}>
             All images on this page are the exclusive property of <strong style={{ color: 'var(--gold)' }}>Usha Photo Studio</strong>.<br />
            Unauthorized copying, reproduction, or distribution is strictly prohibited.<br />
            {COPYRIGHT_TEXT} · All Rights Reserved.
          </p>
        </div>

      </div>
    </div>
  );
}