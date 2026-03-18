import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NavLink({ to, children, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link to={to} onClick={onClick} style={{
      color: isActive ? 'var(--gold)' : 'var(--text-muted)',
      fontSize: '14px', fontWeight: isActive ? 700 : 400,
      borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
      paddingBottom: '2px', transition: 'all 0.2s', whiteSpace: 'nowrap',
    }}>{children}</Link>
  );
}

// Dropdown wrapper
function Dropdown({ label, isActive, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px',
        color: isActive ? 'var(--gold)' : 'var(--text-muted)',
        fontWeight: isActive ? 700 : 400, fontFamily: 'var(--font-body)',
        borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
        paddingBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px',
        transition: 'all 0.2s', padding: '0 0 2px 0',
      }}>
        {label} <span style={{ fontSize: '10px', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 200, overflow: 'hidden',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function DropItem({ to, icon, label, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} onClick={() => { onClick?.(); }} style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
      fontSize: '13px', fontWeight: isActive ? 700 : 400,
      color: isActive ? 'var(--gold)' : 'var(--text)',
      background: isActive ? 'rgba(212,175,55,0.08)' : 'transparent',
      borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
      transition: 'all 0.15s', textDecoration: 'none',
    }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface3)'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <span>{icon}</span> {label}
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

  const isOrderActive   = location.pathname === '/order';
  const isDashboardActive = location.pathname.startsWith('/owner/dashboard');
  const isCalendarActive  = location.pathname === '/calendar';
  const isServicesActive  = location.pathname === '/services';

  // Owner dropdown active if on any owner page
  const isOwnerActive = location.pathname.startsWith('/owner/');

  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <img src="/logo.png" alt="Usha Studio" style={{
            width: '42px', height: '42px', borderRadius: '50%',
            objectFit: 'cover', border: '2px solid var(--gold)', background: 'transparent', flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)', fontWeight: 900 }}>
            Usha <span style={{ color: 'var(--text)', fontWeight: 400 }}>Photo Studio</span>
          </span>
        </Link>

        {/* ── Hamburger ────────────────────────────────────────── */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>

        {/* ── Nav links ─────────────────────────────────────────── */}
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>

          {/* ── Services dropdown (always visible) ─ */}
          <Dropdown label="Services" isActive={isServicesActive}>
            <DropItem to="/services"   icon="💼" label="All Services"    onClick={close} />
            <DropItem to="/order"      icon="📤" label="Place Order"     onClick={close} />
            <DropItem to="/track"      icon="🔍" label="Track Order"     onClick={close} />
          </Dropdown>

          {/* ── Menu Tab ─── */}
          <Dropdown label="Menu" isActive={isCalendarActive}>
            <DropItem to="/calendar"  icon="📅" label="Booking Calendar" onClick={close} />
            <DropItem to="/portfolio" icon="🖼️" label="Our Work"          onClick={close} />
            <DropItem to="/about"     icon="ℹ️"  label="About Us"          onClick={close} />
            <DropItem to="/track"     icon="🔍" label="Track Order"       onClick={close} />
          </Dropdown>

          {user ? (
            <>
              {user.role === 'owner' && (
                <>
                  <Link to="/owner/dashboard" onClick={close} className="btn btn-sm"
                    style={{
                      background: isDashboardActive ? 'var(--gold)' : 'transparent',
                      color: isDashboardActive ? 'var(--black)' : 'var(--gold)',
                      border: '1px solid var(--gold)',
                    }}>📊 Dashboard</Link>

                  {/* Owner tools dropdown */}
                  <Dropdown label="Owner Tools" isActive={isOwnerActive && !isDashboardActive}>
                    <DropItem to="/owner/data"      icon="🗄"  label="Data Manager"  onClick={close} />
                    <DropItem to="/owner/portfolio" icon="📁"  label="Portfolio"     onClick={close} />
                    <DropItem to="/owner/about"     icon="ℹ️"   label="About Us Edit" onClick={close} />
                    <DropItem to="/owner/calendar"  icon="📅"  label="Manage Bookings" onClick={close} />
                    <DropItem to="/owner/settings"  icon="⚙️"  label="Settings"      onClick={close} />
                    <DropItem to="/owner/qr-poster" icon="📱"  label="QR Poster"     onClick={close} />
                  </Dropdown>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-sm"
                style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Owner Login</NavLink>
              <Link to="/order" onClick={close} className="btn btn-sm"
                style={{
                  background: isOrderActive ? 'var(--gold-light)' : 'var(--gold)',
                  color: 'var(--black)', fontWeight: 700,
                  border: isOrderActive ? '2px solid var(--gold-dark)' : 'none',
                }}>
                Place Order
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}