import React, { useState } from 'react';
import { registerRequest } from '../services/api';

const DISTRICTS = ['Cusco', 'Santiago', 'Wanchaq', 'San Sebastián', 'San Jerónimo', 'Poroy', 'Saylla'];

export default function RegisterPage({ onLoginSuccess, onNavigate }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'donor',
    district: 'Cusco',
    password: '',
  });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await registerRequest(form);
      onLoginSuccess(res.user, res.token);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo completar el registro.');
    }
  }

  return (
    <section className="mk-auth-wrap">
      <div className="mk-card mk-auth-card">
        <span className="mk-eyebrow">ÚNETE A LA RED SOLIDARIA</span>
        <h2>Crear cuenta en MIKUY</h2>

        {error && (
          <div className="mk-alert mk-alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mk-form">
          <label>
            Nombre completo o de la organización
            <input
              required
              minLength={3}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            Correo electrónico
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Tipo de cuenta
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="donor">Donante (comercio, mercado, hotel)</option>
              <option value="organization">Organización beneficiaria (comedor, albergue)</option>
            </select>
          </label>
          <label>
            Distrito de Cusco
            <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label>
            Contraseña (mínimo 8 caracteres, cifrada con Laravel Bcrypt)
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button type="submit" className="mk-btn mk-btn-primary">
            Registrarme
          </button>
        </form>

        <p className="mk-muted" style={{ marginTop: 14, fontSize: 13 }}>
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="mk-link" onClick={() => onNavigate('login')}>
            Inicia sesión
          </button>
        </p>
      </div>
    </section>
  );
}
