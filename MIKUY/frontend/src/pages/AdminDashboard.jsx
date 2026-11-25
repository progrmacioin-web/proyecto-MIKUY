import React, { useEffect, useState } from 'react';
import {
  fetchAdminDashboard,
  toggleUserStatus,
  fetchOptimizationBenchmark,
} from '../services/api';
import ProfileEditor from '../components/ProfileEditor';
import { formatRole } from '../utils/foodHelpers';

export default function AdminDashboard({ user, onUserUpdated, onToast }) {
  const [data, setData] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [tab, setTab] = useState('overview');

  async function load() {
    try {
      const res = await fetchAdminDashboard();
      setData(res);
    } catch {
      onToast?.('Error al cargar el panel administrativo.');
    }
  }

  async function runBenchmark() {
    try {
      const res = await fetchOptimizationBenchmark('Cusco');
      setBenchmark(res);
      setTab('optimization');
    } catch {
      onToast?.('No se pudo ejecutar el laboratorio EXPLAIN.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(id) {
    try {
      await toggleUserStatus(id);
      onToast?.('Estado de cuenta actualizado en MySQL.');
      load();
    } catch (err) {
      onToast?.(err.response?.data?.error || 'No se pudo cambiar el estado.');
    }
  }

  if (!data) return <p className="mk-muted">Cargando panel administrativo...</p>;

  const maxKg = Math.max(1, ...data.by_district.map((d) => Number(d.total_kg || 0)));

  return (
    <section className="mk-stack">
      <div className="mk-dash-banner">
        <div className="mk-banner-profile">
          <div className="mk-avatar-sm">
            {user.photo_data ? <img src={user.photo_data} alt={user.name} /> : <span>{user.name.slice(0, 1)}</span>}
          </div>
          <div>
            <span className="mk-eyebrow">CENTRO DE CONTROL ADMINISTRATIVO · RBAC</span>
            <h2>Hola, {user.name}</h2>
            <p>Supervisa usuarios, cobertura territorial y rendimiento de consultas Laravel Eloquent.</p>
          </div>
        </div>
        <div className="mk-tabs">
          <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
            Dashboard General
          </button>
          <button type="button" className={tab === 'optimization' ? 'active' : ''} onClick={runBenchmark}>
            ⚡ Optimización EXPLAIN
          </button>
          <button type="button" className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>
            👤 Mi Perfil
          </button>
        </div>
      </div>

      <div className="mk-kpi-grid">
        <div className="mk-kpi">
          <small>CUENTAS REGISTRADAS</small>
          <strong>{data.kpis.total_users}</strong>
          <span>{data.kpis.donors} donantes · {data.kpis.organizations} orgs.</span>
        </div>
        <div className="mk-kpi">
          <small>PUBLICACIONES TOTALES</small>
          <strong>{data.kpis.total_donations}</strong>
        </div>
        <div className="mk-kpi mk-kpi-warn">
          <small>SOLICITUDES PENDIENTES</small>
          <strong>{data.kpis.pending_requests}</strong>
        </div>
        <div className="mk-kpi">
          <small>ENTREGAS CONFIRMADAS</small>
          <strong>{data.kpis.confirmed_deliveries}</strong>
        </div>
      </div>

      {tab === 'profile' && (
        <ProfileEditor user={user} onUserUpdated={onUserUpdated} onToast={onToast} />
      )}

      {tab === 'optimization' && benchmark && (
        <div className="mk-card mk-stack">
          <div>
            <span className="mk-eyebrow">EVIDENCIA EN VIVO · SECCIÓN 7.7 Y ANEXO G</span>
            <h3>Optimización de Consultas con Laravel Eloquent ORM + Índices MySQL</h3>
          </div>
          <div className="mk-kpi-grid">
            <div className="mk-kpi mk-kpi-bad">
              <small>ANTES (N+1 + SELECT *)</small>
              <strong>{benchmark.before.queries} queries</strong>
              <span>{benchmark.before.time_ms} ms</span>
            </div>
            <div className="mk-kpi">
              <small>DESPUÉS (EAGER LOADING)</small>
              <strong>{benchmark.after.queries} queries</strong>
              <span>{benchmark.after.time_ms} ms</span>
            </div>
            <div className="mk-kpi">
              <small>REDUCCIÓN DE QUERIES</small>
              <strong>-{benchmark.reduction_pct}%</strong>
              <span>Paginación: {benchmark.after.rows} filas/pág.</span>
            </div>
          </div>
          <h4>EXPLAIN Antes vs. Después</h4>
          <div className="mk-grid-2">
            <div>
              <strong>Antes:</strong>
              <pre className="mk-code">{JSON.stringify(benchmark.explain_before, null, 2)}</pre>
            </div>
            <div>
              <strong>Después:</strong>
              <pre className="mk-code">{JSON.stringify(benchmark.explain_after, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {tab === 'overview' && (
        <>
          <div className="mk-card">
            <h3>Cobertura por distrito en Cusco (kg registrados)</h3>
            <div className="mk-bars">
              {data.by_district.map((row) => {
                const kg = Number(row.total_kg || 0);
                return (
                  <div key={row.district} className="mk-bar-row">
                    <span>{row.district}</span>
                    <div className="mk-bar-track">
                      <div style={{ width: `${Math.round((kg / maxKg) * 100)}%` }} />
                    </div>
                    <strong>{kg} kg ({row.lotes})</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mk-card">
            <h3>Gestión de usuarios y control de acceso</h3>
            <div className="mk-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Distrito</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{formatRole(u.role)}</td>
                      <td>{u.district}</td>
                      <td>{u.active ? 'Activo' : 'Desactivado'}</td>
                      <td>
                        <button
                          type="button"
                          className="mk-btn mk-btn-outline mk-btn-sm"
                          disabled={u.id === user.id}
                          onClick={() => handleToggle(u.id)}
                        >
                          {u.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
