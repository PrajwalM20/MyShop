import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function ImageUploader({ label, hint, currentUrl, endpoint, onUploaded, round }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (currentUrl) setPreview(currentUrl); }, [currentUrl]);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) { setFile(accepted[0]); setPreview(URL.createObjectURL(accepted[0])); }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }, maxFiles: 1,
  });

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null);
      onUploaded(data.imageUrl || data.logoUrl);
      toast.success('✅ Photo uploaded!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{label}</div>
      {hint && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>{hint}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
        <div {...getRootProps()} style={{
          border: `2px dashed ${isDragActive ? 'var(--gold)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)', padding: '24px 12px', textAlign: 'center',
          cursor: 'pointer', background: isDragActive ? 'rgba(212,175,55,0.05)' : 'var(--surface2)', transition: 'all 0.2s',
        }}>
          <input {...getInputProps()} />
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>🖼️</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{isDragActive ? 'Drop here!' : 'Tap or drag to select'}</p>
        </div>
        {preview && (
          <div>
            <img src={preview} alt="Preview" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: round ? '50%' : 'var(--radius-lg)', border: `2px solid ${round ? 'var(--gold)' : 'var(--border)'}` }} />
            {file && (
              <button onClick={upload} className="btn btn-primary btn-sm" disabled={uploading} style={{ width: '100%', marginTop: '8px' }}>
                {uploading ? <span className="spinner" /> : '⬆️ Upload'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManageAboutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [about, setAbout] = useState({
    title: '', description: '', founded: '', location: '', tagline: '',
    ownerName: '', ownerRole: 'Founder & Photographer', ownerBio: '',
    phone: '', whatsapp: '', email: '', instagram: '', facebook: '',
    imageUrl: '', ownerImageUrl: '', logoUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('studio');

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    api.get('/about').then(({ data }) => setAbout(data)).catch(() => toast.error('Failed to load'));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/about', {
        title: about.title, description: about.description,
        founded: about.founded, location: about.location, tagline: about.tagline,
        ownerName: about.ownerName, ownerRole: about.ownerRole, ownerBio: about.ownerBio,
        phone: about.phone, whatsapp: about.whatsapp, email: about.email,
        instagram: about.instagram, facebook: about.facebook,
      });
      toast.success('✅ Saved to database!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const f = (field) => ({ value: about[field] || '', onChange: e => setAbout(a => ({ ...a, [field]: e.target.value })) });

  const TABS = [
    { id: 'studio',  label: '🏪 Studio Info' },
    { id: 'owner',   label: '👤 Owner / Team' },
    { id: 'photos',  label: '📸 Photos & Logo' },
    { id: 'contact', label: '📞 Contact & Social' },
  ];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '820px' }}>

        <div className="fade-in" style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '34px', marginBottom: '6px' }}>About Us <span className="text-gold">Editor</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>All changes save to database and appear on homepage instantly</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px',
              background: activeTab === t.id ? 'var(--gold)' : 'transparent',
              color: activeTab === t.id ? 'var(--black)' : 'var(--text-muted)',
              fontWeight: activeTab === t.id ? 700 : 400, fontFamily: 'var(--font-body)', transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── STUDIO INFO ── */}
        {activeTab === 'studio' && (
          <div className="card fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>🏪 Studio Information</h3>
            <div className="input-group">
              <label>Studio / Section Title</label>
              <input {...f('title')} placeholder="e.g. About Usha Photo Studio" />
            </div>
            <div className="input-group">
              <label>Tagline</label>
              <input {...f('tagline')} placeholder="e.g. Capturing Moments Forever" />
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea {...f('description')} rows={5} placeholder="Tell your story — who you are, your experience, what makes you special..." style={{ resize: 'vertical' }} />
            </div>
            <div className="grid-2" style={{ gap: '16px' }}>
              <div className="input-group">
                <label>Year Founded</label>
                <input {...f('founded')} placeholder="e.g. 2010" />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input {...f('location')} placeholder="e.g. Nanjangud, Karnataka" />
              </div>
            </div>
            <button onClick={save} className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
              {saving ? <span className="spinner" /> : '💾 Save to Database'}
            </button>
          </div>
        )}

        {/* ── OWNER / TEAM ── */}
        {activeTab === 'owner' && (
          <div className="card fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>👤 Owner / Photographer</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>This appears in the About Us section on the homepage</p>
            <div className="grid-2" style={{ gap: '16px' }}>
              <div className="input-group">
                <label>Owner / Photographer Name</label>
                <input {...f('ownerName')} placeholder="e.g. Usha Devi" />
              </div>
              <div className="input-group">
                <label>Role / Title</label>
                <input {...f('ownerRole')} placeholder="e.g. Founder & Photographer" />
              </div>
            </div>
            <div className="input-group">
              <label>Owner Bio (short description)</label>
              <textarea {...f('ownerBio')} rows={4} placeholder="e.g. With over 15 years of experience in photography, I specialize in capturing life's most precious moments..." style={{ resize: 'vertical' }} />
            </div>
            <button onClick={save} className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
              {saving ? <span className="spinner" /> : '💾 Save Owner Info'}
            </button>
          </div>
        )}

        {/* ── PHOTOS & LOGO ── */}
        {activeTab === 'photos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card fade-in">
              <ImageUploader
                label="Shop Logo (shown in navbar & homepage)"
                hint="This replaces the logo shown in the top navbar. Upload circular logo for best result."
                currentUrl={about.logoUrl}
                endpoint="/about/logo"
                onUploaded={(url) => setAbout(a => ({ ...a, logoUrl: url }))}
                round={true}
              />
            </div>
            <div className="card fade-in">
              <ImageUploader
                label="About Us Studio Photo"
                hint="Large photo shown in the About Us section. Works best as a square image."
                currentUrl={about.imageUrl}
                endpoint="/about/image"
                onUploaded={(url) => setAbout(a => ({ ...a, imageUrl: url }))}
                round={true}
              />
            </div>
            <div className="card fade-in">
              <ImageUploader
                label="Owner / Photographer Photo"
                hint="Photo of the owner or photographer. Shown next to owner name."
                currentUrl={about.ownerImageUrl}
                endpoint="/about/owner-image"
                onUploaded={(url) => setAbout(a => ({ ...a, ownerImageUrl: url }))}
                round={true}
              />
            </div>
          </div>
        )}

        {/* ── CONTACT & SOCIAL ── */}
        {activeTab === 'contact' && (
          <div className="card fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>📞 Contact & Social Media</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Shown in About Us page and contact section</p>
            <div className="grid-2" style={{ gap: '16px' }}>
              <div className="input-group">
                <label>📞 Phone</label>
                <input {...f('phone')} placeholder="e.g. 9353588862" />
              </div>
              <div className="input-group">
                <label>💬 WhatsApp</label>
                <input {...f('whatsapp')} placeholder="e.g. 9353588862" />
              </div>
              <div className="input-group">
                <label>✉️ Email</label>
                <input {...f('email')} placeholder="your@email.com" />
              </div>
              <div className="input-group">
                <label>📸 Instagram</label>
                <input {...f('instagram')} placeholder="e.g. @ushastudio" />
              </div>
              <div className="input-group">
                <label>👤 Facebook</label>
                <input {...f('facebook')} placeholder="e.g. facebook.com/ushastudio" />
              </div>
            </div>
            <button onClick={save} className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
              {saving ? <span className="spinner" /> : '💾 Save Contact Info'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}