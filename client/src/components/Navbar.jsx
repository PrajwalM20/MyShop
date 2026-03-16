import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Active link helper — returns gold color + underline if path matches
function NavLink({ to, children, onClick, style = {} }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        color: isActive ? 'var(--gold)' : 'var(--text-muted)',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 400,
        borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
        paddingBottom: '2px',
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const handleLogout = () => { logout(); navigate('/'); close(); };

  // Check if current page is active for button styling
  const isOrderActive = location.pathname === '/order';
  const isDashboardActive = location.pathname.startsWith('/owner/dashboard');

  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        {/* Logo — circular Usha Studio image + text */}
        <Link to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img
            src="/logo.svg"
            alt="Usha Studio"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--gold)',
              background: 'transparent',
            }}
          />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)', fontWeight: 900 }}>
            Usha <span style={{ color: 'var(--text)', fontWeight: 400 }}>Photo Studio</span>
          </span>
        </Link>

        {/* Hamburger for mobile */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>

        {/* Nav links */}
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>

          {/* Client nav */}
          <NavLink to="/portfolio" onClick={close}>Our Work</NavLink>
          <NavLink to="/track" onClick={close}>Track Order</NavLink>

          {user ? (
            <>
              {user.role === 'owner' && (
                <>
                  <Link
                    to="/owner/dashboard"
                    onClick={close}
                    className="btn btn-sm"
                    style={{
                      background: isDashboardActive ? 'var(--gold)' : 'transparent',
                      color: isDashboardActive ? 'var(--black)' : 'var(--gold)',
                      border: '1px solid var(--gold)',
                    }}
                  >
                    📊 Dashboard
                  </Link>
                  <NavLink to="/owner/data" onClick={close}>🗄 Data</NavLink>
                  <NavLink to="/owner/portfolio" onClick={close}>📁 Portfolio</NavLink>
                  <NavLink to="/owner/settings" onClick={close}>⚙️ Settings</NavLink>
                </>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-sm"
                style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Owner Login</NavLink>
              <Link
                to="/order"
                onClick={close}
                className="btn btn-sm"
                style={{
                  background: isOrderActive ? 'var(--gold-light)' : 'var(--gold)',
                  color: 'var(--black)',
                  fontWeight: 700,
                  border: isOrderActive ? '2px solid var(--gold)' : 'none',
                }}
              >
                Place Order
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}