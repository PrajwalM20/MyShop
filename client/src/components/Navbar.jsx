import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// ── Active nav link ───────────────────────────────────────────
function NavLink({ to, children, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link to={to} onClick={onClick} style={{
      color: active ? 'var(--gold)' : 'var(--text-muted)',
      fontSize: '15px', fontWeight: active ? 700 : 400,
      borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
      paddingBottom: '2px', transition: 'all 0.2s', whiteSpace: 'nowrap',
    }}>{children}</Link>
  );
}

// ── Dropdown ──────────────────────────────────────────────────
function Dropdown({ label, isActive, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px',
        color: isActive ? 'var(--gold)' : 'var(--text-muted)',
        fontWeight: isActive ? 700 : 400, fontFamily: 'var(--font-body)',
        borderBottom: isActive ? '2px solid var(--gold)' : '2px solid transparent',
        paddingBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px',
        transition: 'all 0.2s', padding: '0 0 2px 0',
      }}>
        {label}
        <span style={{ fontSize: '9px', display: 'inline-block', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>
      {open && (
        <div className="dropdown-menu" style={{
          position: 'absolute', top: 'calc(100% + 10px)', left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', minWidth: '190px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)', zIndex: 300, overflow: 'hidden',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function DropItem({ to, icon, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '13px 16px',
      fontSize: '14px', fontWeight: active ? 700 : 400,
      color: active ? 'var(--gold)' : 'var(--text)',
      background: active ? 'rgba(212,175,55,0.08)' : 'transparent',
      borderLeft: active ? '3px solid var(--gold)' : '3px solid transparent',
      transition: 'all 0.15s', textDecoration: 'none',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span> {label}
    </Link>
  );
}

// ── Logo — loads from DB, inline SVG fallback (no external file needed) ──
const FALLBACK_LOGO = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230d0d1a" stroke="%23D4AF37" stroke-width="3"/><text x="50" y="44" text-anchor="middle" font-family="serif" font-size="22" font-weight="bold" fill="%23D4AF37">US</text><text x="50" y="62" text-anchor="middle" font-family="sans-serif" font-size="9" fill="%23888888">USHA STUDIO</text></svg>')}`;

function NavLogo({ onClick }) {
  const [logoSrc, setLogoSrc] = useState(FALLBACK_LOGO);

  useEffect(() => {
    api.get('/about')
      .then(({ data }) => {
        if (data?.logoUrl) setLogoSrc(data.logoUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <Link to="/" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
      <img
        src={logoSrc}
        alt="Usha Studio"
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_LOGO; }}
        style={{
          width: '44px', height: '44px', borderRadius: '50%',
          objectFit: 'cover', border: '2px solid var(--gold)',
          background: 'var(--surface2)', flexShrink: 0,
        }}
      />
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)', fontWeight: 900, letterSpacing: '-0.5px' }}>
        Usha <span style={{ color: 'var(--text)', fontWeight: 400 }}>Photo Studio</span>
      </span>
    </Link>
  );
}

// ── Main Navbar ───────────────────────────────────────────────
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);
  const handleLogout = () => { logout(); navigate('/'); close(); };

  const isOrderActive     = pathname === '/order';
  const isDashActive      = pathname.startsWith('/owner/dashboard');
  const isOwnerActive     = pathname.startsWith('/owner/') && !isDashActive;
  const isMenuActive      = ['/portfolio','/about','/feedback','/track'].includes(pathname);
  const isServicesActive  = ['/order','/track'].includes(pathname);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        {/* Logo — dynamic from DB */}
        <NavLogo onClick={close} />

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ opacity: menuOpen ? 0 : 1 }} />
          <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>

        {/* Nav links */}
        <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>

          {/* Services + Menu — client only, hidden for owner */}
          {(!user || user.role !== 'owner') && (
            <>
              <Dropdown label="Services" isActive={isServicesActive}>
                <DropItem to="/order"     icon="📤" label="Place Order"    onClick={close} />
                <DropItem to="/track"     icon="🔍" label="Track Order"    onClick={close} />
                <DropItem to="/calendar"  icon="📅" label="Book a Session" onClick={close} />
              </Dropdown>

              <Dropdown label="Menu" isActive={isMenuActive}>
                <DropItem to="/portfolio" icon="🖼️" label="Our Work"     onClick={close} />
                <DropItem to="/about"     icon="ℹ️"  label="About Us"     onClick={close} />
                <DropItem to="/feedback"  icon="⭐" label="Feedback"     onClick={close} />
                <DropItem to="/track"     icon="🔍" label="Track Order"  onClick={close} />
              </Dropdown>
            </>
          )}

          {user ? (
            <>
              {user.role === 'owner' && (
                <>
                  <Link to="/owner/dashboard" onClick={close} className="btn btn-sm" style={{
                    background: isDashActive ? 'var(--gold)' : 'transparent',
                    color: isDashActive ? 'var(--black)' : 'var(--gold)',
                    border: '1px solid var(--gold)', fontSize: '13px',
                  }}>📊 Dashboard</Link>

                  <Dropdown label="Services" isActive={isServicesActive}>
                    <DropItem to="/order"     icon="📤" label="Place Order"    onClick={close} />
                    <DropItem to="/track"     icon="🔍" label="Track Order"    onClick={close} />
                    <DropItem to="/calendar"  icon="📅" label="Bookings"       onClick={close} />
                  </Dropdown>

                  <Dropdown label="Owner Tools" isActive={isOwnerActive}>
                    <DropItem to="/owner/data"      icon="🗄"  label="Data Manager"    onClick={close} />
                    <DropItem to="/owner/portfolio" icon="📁"  label="Portfolio"       onClick={close} />
                    <DropItem to="/owner/about"     icon="ℹ️"   label="About Us Editor" onClick={close} />
                    <DropItem to="/owner/feedback"  icon="⭐"  label="Feedback"        onClick={close} />
                    <DropItem to="/owner/settings"  icon="⚙️"  label="Settings"        onClick={close} />
                    <DropItem to="/owner/qr-poster" icon="📱"  label="QR Poster"       onClick={close} />
                  </Dropdown>
                </>
              )}
              <button onClick={handleLogout} className="btn btn-sm"
                style={{ background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: '13px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Owner Login</NavLink>
              <Link to="/order" onClick={close} className="btn btn-sm" style={{
                background: isOrderActive ? 'var(--gold-light)' : 'var(--gold)',
                color: 'var(--black)', fontWeight: 700, fontSize: '13px',
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