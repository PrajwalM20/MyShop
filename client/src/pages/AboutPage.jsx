import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/about').then(({ data }) => { setAbout(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" style={{ width:'48px', height:'48px' }} />
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth:'960px' }}>

        {/* Header */}
        <div className="fade-in" style={{ textAlign:'center', marginBottom:'56px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'100px', padding:'6px 20px', fontSize:'14px', color:'var(--gold)', marginBottom:'20px' }}>
             About Us
          </div>
          <h1 style={{ fontSize:'clamp(34px,6vw,58px)', marginBottom:'14px' }}>
            {about?.title || 'About Usha Photo Studio'}
          </h1>
          {about?.tagline && (
            <p style={{ color:'var(--gold)', fontStyle:'italic', fontSize:'20px' }}>"{about.tagline}"</p>
          )}
        </div>

        {/* Studio section */}
        <div style={{ display:'grid', gridTemplateColumns: about?.imageUrl ? '1fr 1fr' : '1fr', gap:'56px', alignItems:'center', marginBottom:'72px' }}>
          {about?.imageUrl && (
            <div className="fade-in" style={{ display:'flex', justifyContent:'center' }}>
              <div style={{ width:'100%', maxWidth:'360px', aspectRatio:'1', borderRadius:'50%', overflow:'hidden', border:'4px solid var(--gold)', boxShadow:'0 0 80px rgba(212,175,55,0.2)' }}>
                <img src={about.imageUrl} alt={about.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              </div>
            </div>
          )}
          <div className="fade-in fade-in-delay-1">
            <p style={{ color:'var(--text-muted)', lineHeight:1.9, fontSize:'17px', marginBottom:'32px' }}>
              {about?.description || 'We are a professional photo studio providing high-quality photo services.'}
            </p>
            <div style={{ display:'flex', gap:'24px', flexWrap:'wrap', marginBottom:'32px' }}>
              {about?.founded && (
                <div style={{ textAlign:'center', padding:'20px 28px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'36px', color:'var(--gold)', fontWeight:700 }}>{about.founded}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'4px' }}>Year Founded</div>
                </div>
              )}
              {about?.location && (
                <div style={{ display:'flex', alignItems:'center', gap:'10px', color:'var(--text-muted)', fontSize:'16px' }}>
                  <span style={{ fontSize:'28px' }}> </span><span>{about.location}</span>
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
              <Link to="/calendar" className="btn btn-primary"> Book a Session</Link>
              <Link to="/order"    className="btn btn-outline"> Place an Order</Link>
            </div>
          </div>
        </div>

        {/* Owner / Photographer section */}
        {(about?.ownerName || about?.ownerImageUrl) && (
          <div className="fade-in" style={{ marginBottom:'72px' }}>
            <div style={{ textAlign:'center', marginBottom:'36px' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.3)', borderRadius:'100px', padding:'5px 16px', fontSize:'13px', color:'var(--gold)', marginBottom:'12px' }}>
                 Meet the Team
              </div>
              <h2 style={{ fontSize:'clamp(26px,4vw,38px)' }}>The Person Behind the Lens</h2>
            </div>
            <div className="card" style={{ display:'flex', gap:'32px', alignItems:'center', flexWrap:'wrap', padding:'32px' }}>
              {about.ownerImageUrl && (
                <div style={{ flexShrink:0 }}>
                  <img src={about.ownerImageUrl} alt={about.ownerName} style={{ width:'120px', height:'120px', borderRadius:'50%', objectFit:'cover', border:'3px solid var(--gold)', boxShadow:'0 0 30px rgba(212,175,55,0.2)' }} />
                </div>
              )}
              <div style={{ flex:1 }}>
                <h3 style={{ fontSize:'24px', marginBottom:'4px' }}>{about.ownerName}</h3>
                {about.ownerRole && <div style={{ color:'var(--gold)', fontSize:'15px', marginBottom:'12px', fontWeight:600 }}>{about.ownerRole}</div>}
                {about.ownerBio && <p style={{ color:'var(--text-muted)', lineHeight:1.8, fontSize:'16px' }}>{about.ownerBio}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Contact section */}
        {(about?.phone || about?.email || about?.whatsapp || about?.instagram) && (
          <div className="fade-in" style={{ marginBottom:'72px' }}>
            <h2 style={{ fontSize:'28px', textAlign:'center', marginBottom:'28px' }}>Get in Touch</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'14px' }}>
              {about.phone && (
                <a href={`tel:${about.phone}`} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', textDecoration:'none', color:'var(--text)', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--gold)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                >
                  <span style={{ fontSize:'26px' }}> </span>
                  <div><div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Call Us</div><div style={{ fontWeight:700, fontSize:'16px' }}>{about.phone}</div></div>
                </a>
              )}
              {(about.whatsapp || about.phone) && (
                <a href={`https://wa.me/91${about.whatsapp||about.phone}`} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', textDecoration:'none', color:'var(--text)', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#25D366'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                >
                  <span style={{ fontSize:'26px' }}> </span>
                  <div><div style={{ fontSize:'12px', color:'var(--text-muted)' }}>WhatsApp</div><div style={{ fontWeight:700, fontSize:'16px' }}>Chat Now</div></div>
                </a>
              )}
              {about.email && (
                <a href={`mailto:${about.email}`}
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', textDecoration:'none', color:'var(--text)', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--info)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                >
                  <span style={{ fontSize:'26px' }}>️</span>
                  <div><div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Email</div><div style={{ fontWeight:700, fontSize:'15px' }}>{about.email}</div></div>
                </a>
              )}
              {about.instagram && (
                <a href={`https://instagram.com/${about.instagram.replace('@','')}`} target="_blank" rel="noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'16px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', textDecoration:'none', color:'var(--text)', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='#E4405F'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                >
                  <span style={{ fontSize:'26px' }}> </span>
                  <div><div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Instagram</div><div style={{ fontWeight:700, fontSize:'15px' }}>{about.instagram}</div></div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Why Choose Us */}
        <div className="fade-in">
          <h2 style={{ fontSize:'clamp(24px,4vw,36px)', textAlign:'center', marginBottom:'32px' }}>Why Choose Us?</h2>
          <div className="grid-3" style={{ gap:'20px' }}>
            {[
              { icon:'', title:'Professional Quality',   desc:'Every photo printed and processed with care and precision' },
              { icon:'', title:'Fast Turnaround',        desc:'Get notified on WhatsApp the moment your order is ready' },
              { icon:'', title:'Easy Payments',          desc:'Pay via GPay, PhonePe, Paytm or any UPI app' },
              { icon:'', title:'Event Bookings',         desc:'Book us for weddings, ceremonies, and special occasions' },
              { icon:'', title:'Honest Prices',          desc:'Transparent pricing with no hidden charges, always' },
              { icon:'', title:'Trusted Local Studio',   desc:`Serving ${about?.location||'our community'} since ${about?.founded||'years'}` },
            ].map(v => (
              <div key={v.title} className="card" style={{ textAlign:'center', padding:'28px 20px' }}>
                <div style={{ fontSize:'36px', marginBottom:'12px' }}>{v.icon}</div>
                <h3 style={{ fontSize:'17px', marginBottom:'8px' }}>{v.title}</h3>
                <p style={{ color:'var(--text-muted)', fontSize:'14px', lineHeight:1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}