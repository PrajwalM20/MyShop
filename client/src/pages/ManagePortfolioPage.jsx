import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'passport', label: 'Passport Photos' },
  { id: 'print', label: 'Prints' },
  { id: 'school_id', label: 'School ID' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'event', label: 'Events' },
  { id: 'other', label: 'Other' },
];

export default function ManagePortfolioPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'other', description: '', featured: false });

  useEffect(() => {
    if (!user || user.role !== 'owner') { navigate('/login'); return; }
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data } = await api.get('/portfolio');
      setItems(data);
    } catch (err) {
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      setPreview(URL.createObjectURL(accepted[0]));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/jpeg': [], 'image/png': [] }, maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return toast.error('Please select an image');
    if (!form.title) return toast.error('Please enter a title');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', form.title);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('featured', form.featured);

      await api.post('/portfolio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('✅ Portfolio item added!');
      setFile(null);
      setPreview(null);
      setForm({ title: '', category: 'other', description: '', featured: false });
      loadItems();
    } catch (err) {
      toast.error('Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('Deleted!');
      loadItems();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const toggleFeatured = async (item) => {
    try {
      await api.put(`/portfolio/${item._id}`, { featured: !item.featured });
      toast.success(item.featured ? 'Removed from featured' : 'Marked as featured!');
      loadItems();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '1100px' }}>

        <div className="fade-in" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>
            Manage <span className="text-gold">Portfolio</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Upload your best work to showcase on the website</p>
        </div>

        {/* Upload Form */}
        <div className="card fade-in" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>➕ Add New Work</h3>
          <div className="grid-2">
            {/* Dropzone */}
            <div>
              <div {...getRootProps()} style={{
                border: `2px dashed ${isDragActive ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', padding: '32px',
                textAlign: 'center', cursor: 'pointer',
                background: isDragActive ? 'rgba(212,175,55,0.05)' : 'var(--surface2)',
                transition: 'all 0.2s',
                aspectRatio: preview ? 'auto' : '4/3',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <input {...getInputProps()} />
                {preview ? (
                  <img src={preview} alt="preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '240px', objectFit: 'cover' }} />
                ) : (
                  <div>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>📸</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Drop photo here or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form fields */}
            <div>
              <div className="input-group">
                <label>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Passport Photo - Rahul" />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Description (optional)</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short description..." rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', cursor: 'pointer' }}
                onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '4px',
                  background: form.featured ? 'var(--gold)' : 'var(--surface2)',
                  border: `2px solid ${form.featured ? 'var(--gold)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', transition: 'all 0.2s',
                }}>
                  {form.featured ? '✓' : ''}
                </div>
                <span style={{ fontSize: '14px' }}>Mark as Featured ⭐</span>
              </div>
              <button onClick={handleUpload} className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                {uploading ? <span className="spinner" /> : '📤 Upload to Portfolio'}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Portfolio */}
        <div className="fade-in fade-in-delay-1">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px' }}>📁 Your Portfolio ({items.length} items)</h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto' }} />
            </div>
          ) : items.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
              <p>No portfolio items yet. Upload your first work above!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
              {items.map(item => (
                <div key={item._id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', paddingTop: '70%' }}>
                    <img src={item.imageUrl} alt={item.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    {item.featured && (
                      <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        background: 'var(--gold)', color: 'var(--black)',
                        borderRadius: '100px', padding: '2px 8px', fontSize: '10px', fontWeight: 700,
                      }}>⭐ Featured</div>
                    )}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'capitalize' }}>{item.category}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => toggleFeatured(item)} className="btn btn-sm btn-outline" style={{ flex: 1, fontSize: '11px' }}>
                        {item.featured ? '★ Unfeature' : '☆ Feature'}
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="btn btn-sm" style={{ background: 'rgba(255,75,75,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,75,75,0.3)', flex: 1, fontSize: '11px' }}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}