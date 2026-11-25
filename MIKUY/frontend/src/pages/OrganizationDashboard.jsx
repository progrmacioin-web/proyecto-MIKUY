import React, { useEffect, useState } from 'react';
import {
  fetchOrganizationDashboard,
  confirmDeliveryRequest,
  createOrganizationNeed,
} from '../services/api';
import QrCertificateCard from '../components/QrCertificateCard';
import ProfileEditor from '../components/ProfileEditor';
import RequestChatModal from '../components/RequestChatModal';
import { STATUS_LABELS } from '../utils/foodHelpers';

export default function OrganizationDashboard({ user, onUserUpdated, onToast, onNavigate }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('overview');
  const [activeCert, setActiveCert] = useState(null);
  const [chatReq, setChatReq] = useState(null);
  const [needForm, setNeedForm] = useState({
    product: '',
    category: 'Tubérculos',
    qty: '15',
    unit: 'kg',
    priority: 'high',
    storage: 'ambient',
  });

  async function load() {
    try {
      const res = await fetchOrganizationDashboard();
      setData(res);
    } catch {
      onToast?.('Error al cargar el panel de organización.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConfirm(deliveryId) {
    try {
      await confirmDeliveryRequest(deliveryId);
      onToast?.('Recepción confirmada. Constancia QR actualizada.');
      load();
    } catch (err) {
      onToast?.(err.response?.data?.error || 'No se pudo confirmar.');
    }
  }

  async function handleAddNeed(e) {
    e.preventDefault();
    try {
      await createOrganizationNeed(needForm);
      onToast?.('Necesidad alimentaria registrada.');
      setNeedForm({ ...needForm, product: '' });
      load();
    } catch (err) {
      onToast?.(err.response?.data?.error || 'Error al registrar necesidad.');
    }
  }

  if (!data) return <p className="mk-muted">Cargando panel de organización...</p>;

  return (
    <section className="mk-stack">
      <div className="mk-dash-banner">
        <div className="mk-banner-profile">
          <div className="mk-avatar-sm">
            {user.photo_data ? <img src={user.photo_data} alt={user.name} /> : <span>{user.name.slice(0, 1)}</span>}
          </div>
          <div>
            <span className="mk-eyebrow">DASHBOARD ORGANIZACIÓN · {user.district.toUpperCase()}</span>
            <h2>Hola, {user.name}</h2>
            <p>Muestra tus Tickets QR al recoger, chatea con donantes y edita tu perfil.</p>
          </div>
        </div>
        <div className="mk-tabs">
          <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
            Tickets y Mensajes
          </button>
          <button type="button" onClick={() => onNavigate('catalog')}>
            ⌕ Adquirir alimentos
          </button>
          <button type="button" className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>
            👤 Mi Perfil
          </button>
        </div>
      </div>

      <div className="mk-kpi-grid">
        <div className="mk-kpi">
          <small>SOLICITUDES</small>
          <strong>{data.kpis.total_requests}</strong>
        </div>
        <div className="mk-kpi mk-kpi-warn">
          <small>POR RECOGER (TICKET ACTIVO)</small>
          <strong>{data.kpis.scheduled_deliveries}</strong>
        </div>
        <div className="mk-kpi">
          <small>ENTREGAS CONFIRMADAS</small>
          <strong>{data.kpis.confirmed_certificates}</strong>
        </div>
        <div className="mk-kpi">
          <small>KG RECIBIDOS</small>
          <strong>{data.kpis.confirmed_kg} kg</strong>
        </div>
      </div>

      {tab === 'profile' ? (
        <ProfileEditor user={user} onUserUpdated={onUserUpdated} onToast={onToast} />
      ) : (
        <>
          <div className="mk-card">
            <h3>Mis Tickets de Recojo QR y Mensajería con Donantes</h3>
            {data.requests.length === 0 ? (
              <p className="mk-muted">Aún no has adquirido alimentos. Entra al Catálogo para generar tu primer Ticket QR.</p>
            ) : (
              <div className="mk-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Alimento</th>
                      <th>Donante</th>
                      <th>Cantidad</th>
                      <th>Ticket QR / PIN</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.requests.map((r) => {
                      const del = r.delivery;
                      return (
                        <tr key={r.id}>
                          <td>{r.donation?.name}</td>
                          <td>{r.donation?.owner?.name || 'Donante'}</td>
                          <td>{r.qty} {r.donation?.unit}</td>
                          <td>
                            {del ? (
                              <>
                                <code>{del.certificate_code}</code>
                                <br />
                                <small className="mk-muted">PIN: {del.pickup_pin}</small>
                              </>
                            ) : '—'}
                          </td>
                          <td>{STATUS_LABELS[del?.status || r.status] || r.status}</td>
                          <td>
                            <div className="mk-row-actions">
                              {del && (
                                <button
                                  type="button"
                                  className="mk-btn mk-btn-primary mk-btn-sm"
                                  onClick={() =>
                                    setActiveCert({
                                      ...del,
                                      donation: r.donation,
                                      organization: user,
                                    })
                                  }
                                >
                                  🎫 Ver Ticket QR
                                </button>
                              )}
                              {del && del.status === 'scheduled' && (
                                <button
                                  type="button"
                                  className="mk-btn mk-btn-outline mk-btn-sm"
                                  onClick={() => handleConfirm(del.id)}
                                >
                                  Confirmar recibido
                                </button>
                              )}
                              <button
                                type="button"
                                className="mk-btn mk-btn-ghost mk-btn-sm"
                                onClick={() => setChatReq(r)}
                              >
                                💬 Chat
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeCert && (
              <QrCertificateCard
                delivery={activeCert}
                authorizationMessage={
                  activeCert.status === 'scheduled'
                    ? `Muestra este Ticket QR al donante al momento de recoger (${activeCert.qty} ${activeCert.unit} de ${activeCert.donation?.name}).`
                    : 'Recepción confirmada satisfactoriamente.'
                }
              />
            )}
          </div>

          {data.recommendations.length > 0 && (
            <div className="mk-card">
              <span className="mk-eyebrow">RECOMENDACIONES COMPATIBLES (MOTOR POO)</span>
              <h3>Lotes sugeridos para tu organización</h3>
              <div className="mk-grid-2">
                {data.recommendations.map((rec) => (
                  <div key={rec.id} className="mk-rec-item">
                    <div>
                      <strong>{rec.name}</strong>
                      <p className="mk-muted">{rec.qty} {rec.unit} · {rec.district}</p>
                    </div>
                    <span className="mk-pill mk-pill-ok">{rec.score}% compatible</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mk-card">
            <h3>Registrar necesidad alimentaria</h3>
            <form onSubmit={handleAddNeed} className="mk-form-grid">
              <label>
                Alimento requerido
                <input required placeholder="Ej. Papa nativa, arroz" value={needForm.product} onChange={(e) => setNeedForm({ ...needForm, product: e.target.value })} />
              </label>
              <label>
                Categoría
                <select value={needForm.category} onChange={(e) => setNeedForm({ ...needForm, category: e.target.value })}>
                  <option>Tubérculos</option>
                  <option>Verduras</option>
                  <option>Frutas</option>
                  <option>Cereales</option>
                  <option>Menestras</option>
                </select>
              </label>
              <label>
                Cantidad (kg)
                <input type="number" min="1" required value={needForm.qty} onChange={(e) => setNeedForm({ ...needForm, qty: e.target.value })} />
              </label>
              <label>
                Prioridad
                <select value={needForm.priority} onChange={(e) => setNeedForm({ ...needForm, priority: e.target.value })}>
                  <option value="high">Alta</option>
                  <option value="normal">Normal</option>
                  <option value="low">Baja</option>
                </select>
              </label>
              <div className="full">
                <button type="submit" className="mk-btn mk-btn-primary mk-btn-sm">
                  Guardar necesidad
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {chatReq && (
        <RequestChatModal
          requestItem={chatReq}
          currentUser={user}
          onClose={() => setChatReq(null)}
          onToast={onToast}
        />
      )}
    </section>
  );
}
