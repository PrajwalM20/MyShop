import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">Usha<span>Studio</span></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/track" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track Order</Link>
          {user ? (
            <>
              {user.role === 'owner' && (
                <>
                  <Link to="/owner/dashboard" className="btn btn-outline btn-sm">📊 Dashboard</Link>
                  <Link to="/owner/qr-poster" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>QR Poster</Link>
                  <Link to="/owner/settings" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>⚙️ Settings</Link>
                </>
              )}
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user.name}</span>
              <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'var(--surface2)', color: 'var(--text)' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Login</Link>
              <Link to="/order" className="btn btn-primary btn-sm">Place Order</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
