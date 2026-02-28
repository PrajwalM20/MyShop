import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={close}>
          Usha <span>Photo Studio</span>
        </Link>

        {/* Hamburger for mobile */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>

        {/* Nav links */}
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <Link to="/portfolio" onClick={close} style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Our Work</Link>
          <Link to="/track" onClick={close} style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track Order</Link>

          {user ? (
            <>
              {user.role === 'owner' && (
                <>
                  <Link to="/owner/dashboard" onClick={close} className="btn btn-outline btn-sm">📊 Dashboard</Link>
                  <Link to="/owner/portfolio" onClick={close} style={{ color: 'var(--text-muted)', fontSize: '13px' }}>📁 Portfolio</Link>
                  <Link to="/owner/settings" onClick={close} style={{ color: 'var(--text-muted)', fontSize: '13px' }}>⚙️ Settings</Link>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-sm"
                style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close} style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Owner Login</Link>
              <Link to="/order" onClick={close} className="btn btn-primary btn-sm">Place Order</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}