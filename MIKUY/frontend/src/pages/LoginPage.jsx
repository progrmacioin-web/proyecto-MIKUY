import React, { useState } from 'react';
import { loginRequest } from '../services/api';

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginRequest(email, password);
      onLoginSuccess(res.user, res.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail) {
    setEmail(demoEmail);
    setPassword('Mikuy2026!');
  }

  return (
    <section className="mk-auth-wrap">
      <div className="mk-card mk-auth-card">
        <span className="mk-eyebrow">AUTENTICACIÓN SEGURA · LARAVEL BCRYPT + JWT</span>
        <h2>Iniciar sesión en MIKUY</h2>
        <p className="mk-muted">Accede a tu panel de Donante, Organización o Administrador.</p>

        {error && (
          <div className="mk-alert mk-alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mk-form">
          <label htmlFor="login-email">
            Correo electrónico
            <input
              id="login-email"
              type="email"
              required
              placeholder="donante@mikuy.demo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label htmlFor="login-password">
            Contraseña
            <input
              id="login-password"
              type="password"
              required
              placeholder="Mikuy2026!"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="mk-btn mk-btn-primary" disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mk-demo-box">
          <strong>Cuentas precargadas en MySQL (clave: Mikuy2026!):</strong>
          <div className="mk-demo-btns">
            <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={() => fillDemo('donante@mikuy.demo')}>
              Donante
            </button>
            <button
              type="button"
              className="mk-btn mk-btn-ghost mk-btn-sm"
              onClick={() => fillDemo('organizacion@mikuy.demo')}
            >
              Organización
            </button>
            <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={() => fillDemo('admin@mikuy.demo')}>
              Administrador
            </button>
          </div>
        </div>

        <p className="mk-muted" style={{ marginTop: 14, fontSize: 13 }}>
          ¿No tienes cuenta?{' '}
          <button type="button" className="mk-link" onClick={() => onNavigate('register')}>
            Regístrate aquí
          </button>
        </p>
      </div>
    </section>
  );
}
