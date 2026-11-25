import React, { useEffect, useState } from 'react';
import {
  fetchDonorDashboard,
  createDonation,
  updateDonation,
  retireDonation,
  acceptFoodRequest,
  rejectFoodRequest,
} from '../services/api';
import { compressImageFile } from '../utils/imageUpload';
import FoodCard from '../components/FoodCard';
import ProfileEditor from '../components/ProfileEditor';
import RequestChatModal from '../components/RequestChatModal';
import TicketValidator from '../components/TicketValidator';
import { STATUS_LABELS } from '../utils/foodHelpers';

const CATEGORIES = ['Tubérculos', 'Verduras', 'Frutas', 'Cereales', 'Menestras', 'Productos envasados'];
const DISTRICTS = ['Cusco', 'Santiago', 'Wanchaq', 'San Sebastián', 'San Jerónimo', 'Poroy', 'Saylla'];

export default function DonorDashboard({ user, onUserUpdated, onToast }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('overview');
  const [editingId, setEditingId] = useState(null);
  const [chatReq, setChatReq] = useState(null);

  const emptyForm = {
    name: '',
    category: 'Tubérculos',
    qty: '15',
    unit: 'kg',
    expiry: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    district: user?.district || 'Cusco',
    place: '',
    description: '',
    storage_type: 'ambient',
    photo_data: '',
  };
  const [form, setForm] = useState(emptyForm);

  async function load() {
    try {
      const res = await fetchDonorDashboard();
      setData(res);
    } catch {
      onToast?.('Error al cargar el panel de donante.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 720, 0.78);
      setForm((prev) => ({ ...prev, photo_data: compressed }));
      onToast?.('Imagen del producto lista para guardar.');
    } catch (err) {
      onToast?.(err.message);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setTab('publish');
  }

  function startEdit(donation) {
    setEditingId(donation.id);
    setForm({
      name: donation.name || '',
      category: donation.category || 'Tubérculos',
      qty: String(donation.qty || 1),
      unit: donation.unit || 'kg',
      expiry: donation.expiry || emptyForm.expiry,
      district: donation.district || 'Cusco',
      place: donation.place || '',
      description: donation.description || '',
      storage_type: donation.storage_type || 'ambient',
      photo_data: donation.photo_data || '',
    });
    setTab('publish');
  }

  async function handleSubmitProduct(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDonation(editingId, form);
        onToast?.('Producto actualizado correctamente en MySQL.');
      } else {
        await createDonation(form);
        onToast?.('Producto publicado con éxito en MySQL.');
      }
      setEditingId(null);
      setForm(emptyForm);
      setTab('overview');
      load();
    } catch (err) {
      onToast?.(err.response?.data?.error || 'Revisa los datos del alimento.');
    }
  }

  async function handleAccept(id) {
    try {
      await acceptFoodRequest(id, 'Aprobado para recojo solidario.');
      onToast?.('Solicitud aprobada y Ticket QR generado.');
      load();
    } catch (err) {
      onToast?.(err.response?.data?.error || 'No se pudo aprobar.');
    }
  }

  async function handleReject(id) {
    await rejectFoodRequest(id, 'Lote no disponible en este horario.');
    onToast?.('Solicitud rechazada.');
    load();
  }

  async function handleRetire(id) {
    await retireDonation(id);
    onToast?.('Publicación retirada del catálogo.');
    load();
  }

  if (!data) return <p className="mk-muted">Cargando panel de donante...</p>;

  return (
    <section className="mk-stack">
      <div className="mk-dash-banner">
        <div className="mk-banner-profile">
          <div className="mk-avatar-sm">
            {user.photo_data ? <img src={user.photo_data} alt={user.name} /> : <span>{user.name.slice(0, 1)}</span>}
          </div>
          <div>
            <span className="mk-eyebrow">DASHBOARD DONANTE · {user.district.toUpperCase()}</span>
            <h2>Hola, {user.name}</h2>
            <p>Publica o edita alimentos con foto, chatea con organizaciones y valida tickets QR.</p>
          </div>
        </div>
        <div className="mk-tabs">
          <button type="button" className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
            Resumen y Tickets
          </button>
          <button type="button" className={tab === 'publish' ? 'active' : ''} onClick={startCreate}>
            {editingId ? '✎ Editando lote' : '＋ Publicar alimento'}
          </button>
          <button type="button" className={tab === 'validate' ? 'active' : ''} onClick={() => setTab('validate')}>
            📷 Validar Ticket QR
          </button>
          <button type="button" className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>
            👤 Mi Perfil
          </button>
        </div>
      </div>

      <div className="mk-kpi-grid">
        <div className="mk-kpi">
          <small>TOTAL LOTES</small>
          <strong>{data.kpis.total_lots}</strong>
        </div>
        <div className="mk-kpi">
          <small>DISPONIBLES</small>
          <strong>{data.kpis.available_lots}</strong>
        </div>
        <div className="mk-kpi mk-kpi-warn">
          <small>POR ENTREGAR / PENDIENTES</small>
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

      {tab === 'validate' && (
        <TicketValidator allowConfirm onConfirmed={load} onToast={onToast} />
      )}

      {tab === 'publish' && (
        <div className="mk-card">
          <h3>{editingId ? 'Editar lote de alimentos' : 'Publicar nuevo lote de alimentos'}</h3>
          <form onSubmit={handleSubmitProduct} className="mk-form-grid">
            <label>
              Nombre del alimento
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Categoría
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>
              Cantidad
              <input type="number" min="1" step="0.5" required value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
            </label>
            <label>
              Unidad
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="kg">kg</option>
                <option value="unidades">unidades</option>
                <option value="cajas">cajas</option>
                <option value="paquetes">paquetes</option>
              </select>
            </label>
            <label>
              Fecha de vencimiento
              <input type="date" required value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
            </label>
            <label>
              Distrito
              <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
                {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>
              Punto de recojo
              <input placeholder="Ej. Mercado San Pedro, puerta 2" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} />
            </label>
            <label>
              Conservación
              <select value={form.storage_type} onChange={(e) => setForm({ ...form, storage_type: e.target.value })}>
                <option value="ambient">Ambiente fresco y seco</option>
                <option value="refrigerated">Refrigerado</option>
                <option value="frozen">Congelado</option>
              </select>
            </label>

            <label className="full">
              Fotografía del producto (JPG, PNG o WEBP)
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} />
              {form.photo_data && (
                <div className="mk-upload-preview">
                  <img src={form.photo_data} alt="Vista previa del alimento" />
                  <button
                    type="button"
                    className="mk-btn mk-btn-outline mk-btn-sm"
                    onClick={() => setForm((p) => ({ ...p, photo_data: '' }))}
                  >
                    Quitar imagen
                  </button>
                </div>
              )}
            </label>

            <label className="full">
              Descripción
              <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>

            <div className="full mk-row-actions">
              <button type="submit" className="mk-btn mk-btn-primary">
                {editingId ? 'Guardar cambios' : 'Publicar alimento'}
              </button>
              <button
                type="button"
                className="mk-btn mk-btn-outline"
                onClick={() => {
                  setEditingId(null);
                  setTab('overview');
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {tab === 'overview' && (
        <>
          <div className="mk-card">
            <h3>Solicitudes y Tickets de Recojo emitidos</h3>
            {data.requests.length === 0 ? (
              <p className="mk-muted">No hay solicitudes registradas aún.</p>
            ) : (
              <div className="mk-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Alimento</th>
                      <th>Organización autorizada</th>
                      <th>Cantidad</th>
                      <th>Ticket QR / PIN</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.requests.map((r) => (
                      <tr key={r.id}>
                        <td>{r.donation?.name}</td>
                        <td>{r.organization?.name}</td>
                        <td>{r.qty} {r.donation?.unit}</td>
                        <td>
                          {r.delivery ? (
                            <>
                              <code>{r.delivery.certificate_code}</code>
                              <br />
                              <small className="mk-muted">PIN: {r.delivery.pickup_pin}</small>
                            </>
                          ) : '—'}
                        </td>
                        <td>{STATUS_LABELS[r.delivery?.status || r.status] || r.status}</td>
                        <td>
                          <div className="mk-row-actions">
                            {r.status === 'pending' && (
                              <>
                                <button type="button" className="mk-btn mk-btn-primary mk-btn-sm" onClick={() => handleAccept(r.id)}>
                                  Aprobar
                                </button>
                                <button type="button" className="mk-btn mk-btn-outline mk-btn-sm" onClick={() => handleReject(r.id)}>
                                  Rechazar
                                </button>
                              </>
                            )}
                            <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={() => setChatReq(r)}>
                              💬 Chat
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mk-section">
            <h3>Mis publicaciones (haz clic en "Editar" para modificar datos o foto)</h3>
            <div className="mk-grid-3">
              {data.donations.map((d) => (
                <FoodCard key={d.id} donation={d} onEdit={startEdit} onRetire={handleRetire} />
              ))}
            </div>
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
