import React from 'react';
import { formatRole } from '../utils/foodHelpers';

export default function Navbar({
  page,
  onNavigate,
  user,
  onLogout,
  theme,
  onToggleTheme,
}) {
  const goSection = (id) => {
    onNavigate('home');
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  return (
    <div className="mk-header-wrap">
      <div className="mk-topbar">
        <div className="mk-topbar-inner">
          <div className="mk-topbar-info">
            <span>Escríbenos: contacto@mikuycusco.org</span>
            <span>+51 984 000 000</span>
            <span>Cusco, Perú</span>
          </div>
          <div className="mk-topbar-social">
            <a href="#contacto" onClick={(e) => { e.preventDefault(); goSection('contacto'); }}>Facebook</a>
            <a href="#contacto" onClick={(e) => { e.preventDefault(); goSection('contacto'); }}>Instagram</a>
            <a href="#contacto" onClick={(e) => { e.preventDefault(); goSection('contacto'); }}>TikTok</a>
          </div>
        </div>
      </div>

      <header className="mk-header">
        <div className="mk-header-inner">
          <button type="button" className="mk-brand" onClick={() => onNavigate('home')}>
            <img
              src={theme === 'dark' ? '/assets/images/logo-light.svg' : '/assets/images/logo.svg'}
              alt="MIKUY — Red Solidaria"
            />
          </button>

          <nav className="mk-nav" aria-label="Navegación principal">
            <button type="button" className={page === 'home' ? 'active' : ''} onClick={() => goSection('nosotros')}>
              Nosotros
            </button>
            <button type="button" onClick={() => goSection('programas')}>
              Programas
            </button>
            <button type="button" className={page === 'catalog' ? 'active' : ''} onClick={() => onNavigate('catalog')}>
              Catálogo
            </button>
            <button type="button" className={page === 'map' ? 'active' : ''} onClick={() => onNavigate('map')}>
              Mapa Cusco
            </button>
            <button type="button" className={page === 'verify' ? 'active' : ''} onClick={() => onNavigate('verify')}>
              Verificar QR
            </button>
            <button type="button" onClick={() => goSection('contacto')}>
              Contacto
            </button>
            {user && (
              <button
                type="button"
                className={page === 'dashboard' ? 'active' : ''}
                onClick={() => onNavigate('dashboard')}
              >
                Mi Panel ({formatRole(user.role)})
              </button>
            )}
          </nav>

          <div className="mk-header-actions">
            <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={onToggleTheme}>
              {theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
            {user ? (
              <button type="button" className="mk-btn mk-btn-outline mk-btn-sm" onClick={onLogout}>
                Salir
              </button>
            ) : (
              <>
                <button type="button" className="mk-btn mk-btn-outline mk-btn-sm" onClick={() => onNavigate('login')}>
                  Ingresar
                </button>
                <button type="button" className="mk-btn mk-btn-primary mk-btn-sm" onClick={() => onNavigate('register')}>
                  Donar
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
