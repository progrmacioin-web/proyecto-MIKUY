import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import VirtualAssistant from './components/VirtualAssistant';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import MapPage from './pages/MapPage';
import VerifyPage from './pages/VerifyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import OrganizationDashboard from './pages/OrganizationDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { fetchSummary, fetchDonations } from './services/api';

export default function App() {
  const [page, setPage] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('mikuy_theme') || 'light');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mikuy_user') || 'null');
    } catch {
      return null;
    }
  });
  const [summary, setSummary] = useState(null);
  const [donations, setDonations] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('mikuy_theme', theme);
  }, [theme]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [sum, lots] = await Promise.all([fetchSummary(), fetchDonations({ limit: 30 })]);
        setSummary(sum);
        setDonations(lots.data || []);
      } catch {}
    }
    bootstrap();
  }, [page]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  function handleUserUpdated(updatedUser) {
    localStorage.setItem('mikuy_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  function handleLoginSuccess(loggedUser, token) {
    localStorage.setItem('mikuy_token', token);
    localStorage.setItem('mikuy_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
    setPage('dashboard');
    showToast(`Bienvenido, ${loggedUser.name}`);
  }

  function handleLogout() {
    localStorage.removeItem('mikuy_token');
    localStorage.removeItem('mikuy_user');
    setUser(null);
    setPage('home');
    showToast('Sesión cerrada de forma segura.');
  }

  function renderDashboard() {
    if (!user) return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={setPage} />;
    if (user.role === 'donor') {
      return <DonorDashboard user={user} onUserUpdated={handleUserUpdated} onToast={showToast} />;
    }
    if (user.role === 'organization') {
      return (
        <OrganizationDashboard
          user={user}
          onUserUpdated={handleUserUpdated}
          onToast={showToast}
          onNavigate={setPage}
        />
      );
    }
    return <AdminDashboard user={user} onUserUpdated={handleUserUpdated} onToast={showToast} />;
  }

  return (
    <div className="mk-shell">
      <Navbar
        page={page}
        onNavigate={setPage}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />

      {toast && (
        <div className="mk-toast" role="status">
          {toast}
        </div>
      )}

      <main className={page === 'home' ? 'mk-main-full' : 'mk-main'}>
        {page === 'home' && (
          <HomePage summary={summary} donations={donations} onNavigate={setPage} onToast={showToast} />
        )}
        {page === 'catalog' && <CatalogPage user={user} onToast={showToast} />}
        {page === 'map' && <MapPage donations={donations} />}
        {page === 'verify' && <VerifyPage user={user} onToast={showToast} />}
        {page === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={setPage} />}
        {page === 'register' && <RegisterPage onLoginSuccess={handleLoginSuccess} onNavigate={setPage} />}
        {page === 'dashboard' && renderDashboard()}
      </main>

      <VirtualAssistant user={user} page={page} onNavigate={setPage} />

      <footer className="mk-footer">
        <div className="mk-container mk-footer-grid">
          <div>
            <h4>MIKUY · Red Solidaria</h4>
            <p>Central de coordinación: +51 984 000 000</p>
            <p>Contacto general: contacto@mikuycusco.org</p>
            <p>Horario: Lunes a viernes de 8:00 a. m. a 6:00 p. m.</p>
            <p>Cusco, Perú · Universidad Continental</p>
          </div>
          <div>
            <h4>Menú</h4>
            <button type="button" onClick={() => setPage('home')}>Inicio</button>
            <button type="button" onClick={() => setPage('catalog')}>Catálogo</button>
            <button type="button" onClick={() => setPage('map')}>Mapa Cusco</button>
            <button type="button" onClick={() => setPage('verify')}>Verificar QR</button>
          </div>
          <div>
            <h4>Programas</h4>
            <button type="button" onClick={() => setPage('catalog')}>Rescate Alimentario</button>
            <button type="button" onClick={() => setPage('register')}>Comedores Populares</button>
            <button type="button" onClick={() => setPage('register')}>Albergues Cusco</button>
            <button type="button" onClick={() => setPage('verify')}>Tickets QR</button>
          </div>
          <div>
            <h4>Contacto</h4>
            <p>contacto@mikuycusco.org</p>
            <p>Cusco, Perú</p>
            <p>+51 984 000 000</p>
          </div>
        </div>
        <div className="mk-footer-bottom">
          © 2026 MIKUY Red Solidaria de Alimentos y Albergues — Cusco, Perú | Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}
