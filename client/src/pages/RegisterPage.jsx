import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'owner' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created!');
      navigate(user.role === 'owner' ? '/owner/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm(p => ({ ...p, [field]: e.target.value })) });

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 24px' }}>
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--gold)', fontWeight: 900, marginBottom: '8px' }}>ClickQueue</div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Create Account</h1>
        </div>

        <div className="card fade-in fade-in-delay-1">
          <form onSubmit={handleSubmit}>
            <div className="input-group"><label>Full Name</label><input {...f('name')} placeholder="Your name" required /></div>
            <div className="input-group"><label>Email</label><input type="email" {...f('email')} placeholder="your@email.com" required /></div>
            <div className="input-group"><label>Phone</label><input {...f('phone')} placeholder="10-digit number" maxLength={10} required /></div>
            <div className="input-group"><label>Password</label><input type="password" {...f('password')} placeholder="Min 6 characters" minLength={6} required /></div>
            <div className="input-group">
              <label>Account Type</label>
              <select {...f('role')}>
                <option value="owner">Shop Owner</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account →'}
            </button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
