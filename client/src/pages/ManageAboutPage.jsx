import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ManageAboutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [about, setAbout] = useState({ title: '', description: '', founded: '', location: '', tagline: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    api.get('/about').then(({ data }) => {
      setAbout(data);
      if (data.imageUrl) setPreview(data.imageUrl);
    }).catch(() => toast.error('Failed to load About info'));
  }, []);

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) { setFile(accepted[0]); setPreview(URL.createObjectURL(accepted[0])); }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }, maxFiles: 1,
  });

  const uploadImage = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/about/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAbout(a => ({ ...a, imageUrl: data.imageUrl }));
      setFile(null);
      toast.success('✅ Photo updated!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const saveText = async () => {
    setSaving(true);
    try {
      await api.put('/about', { title: about.title, description: about.description, founded: about.founded, location: about.location, tagline: about.tagline });
      toast.success('✅ About Us saved to database!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="fade-in" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '6px' }}>About Us <span className="text-gold">Editor</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Update the "About Us" section shown on the homepage</p>
        </div>

        {/* Photo upload */}
        <div className="card fade-in" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>📸 About Us Photo</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>This photo appears in the About Us section on the homepage</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div {...getRootProps()} style={{
              border: `2px dashed ${isDragActive ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)', padding: '28px 16px', textAlign: 'center',
              cursor: 'pointer', background: isDragActive ? 'rgba(212,175,55,0.05)' : 'var(--surface2)', transition: 'all 0.2s',
            }}>
              <input {...getInputProps()} />
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🖼️</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{isDragActive ? 'Drop here!' : 'Drag & drop or tap to select'}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>JPG, PNG, WEBP</p>
            </div>

            {preview && (
              <div>
                <img src={preview} alt="Preview" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '2px solid var(--border)' }} />
                {file && (
                  <button onClick={uploadImage} className="btn btn-primary" disabled={uploading} style={{ width: '100%', marginTop: '10px' }}>
                    {uploading ? <span className="spinner" /> : '⬆️ Upload Photo'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Text fields */}
        <div className="card fade-in">
          <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>✏️ About Us Content</h3>
          <div className="input-group">
            <label>Section Title</label>
            <input value={about.title} onChange={e => setAbout(a => ({...a, title: e.target.value}))} placeholder="e.g. About Usha Photo Studio" />
          </div>
          <div className="input-group">
            <label>Tagline</label>
            <input value={about.tagline} onChange={e => setAbout(a => ({...a, tagline: e.target.value}))} placeholder="e.g. Capturing Moments Forever" />
          </div>
          <div className="input-group">
            <label>Description</label>
            <textarea value={about.description} onChange={e => setAbout(a => ({...a, description: e.target.value}))} rows={5} placeholder="Tell your story — who you are, how long you've been in business, what makes you special..." style={{ resize: 'vertical' }} />
          </div>
          <div className="grid-2" style={{ gap: '16px' }}>
            <div className="input-group">
              <label>Year Founded</label>
              <input value={about.founded} onChange={e => setAbout(a => ({...a, founded: e.target.value}))} placeholder="e.g. 2010" />
            </div>
            <div className="input-group">
              <label>Location</label>
              <input value={about.location} onChange={e => setAbout(a => ({...a, location: e.target.value}))} placeholder="e.g. Nanjangud, Karnataka" />
            </div>
          </div>
          <button onClick={saveText} className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
            {saving ? <span className="spinner" /> : '💾 Save to Database'}
          </button>
        </div>
      </div>
    </div>
  );
}