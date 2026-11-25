import React, { useEffect, useState } from 'react';
import { fetchDonations, createFoodRequest } from '../services/api';
import FoodCard from '../components/FoodCard';
import QrCertificateCard from '../components/QrCertificateCard';

const DISTRICTS = ['Cusco', 'Santiago', 'Wanchaq', 'San Sebastián', 'San Jerónimo', 'Poroy', 'Saylla'];
const CATEGORIES = ['Tubérculos', 'Verduras', 'Frutas', 'Cereales', 'Menestras', 'Productos envasados'];

export default function CatalogPage({ user, onToast }) {
  const [donations, setDonations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [q, setQ] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reqQty, setReqQty] = useState('');
  const [reqMsg, setReqMsg] = useState('');
  const [generatedTicket, setGeneratedTicket] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchDonations({ q, district, category, page, limit: 9 });
      setDonations(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch {
      onToast?.('No se pudo cargar el catálogo desde la API.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [q, district, category, page]);

  async function handleSubmitRequest(e) {
    e.preventDefault();
    try {
      const res = await createFoodRequest({
        donation_id: selected.id,
        qty: Number(reqQty),
        message: reqMsg,
      });
      onToast?.('¡Ticket de Recojo generado! Muéstralo al donante al recoger.');
      setSelected(null);
      setReqQty('');
      setReqMsg('');
      if (res.ticket) setGeneratedTicket(res.ticket);
      load();
    } catch (err) {
      onToast?.(err.response?.data?.error || 'No se pudo completar la adquisición.');
    }
  }

  return (
    <section className="mk-section">
      <div className="mk-section-head">
        <div>
          <span className="mk-eyebrow">CATÁLOGO EN TIEMPO REAL · LARAVEL + ELOQUENT + MYSQL</span>
          <h2>Alimentos disponibles en Cusco ({pagination.total})</h2>
        </div>
      </div>

      <div className="mk-toolbar">
        <input
          type="search"
          aria-label="Buscar alimento"
          placeholder="Buscar por nombre, distrito o descripción..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Filtrar por distrito"
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los distritos</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          aria-label="Filtrar por categoría"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mk-muted">Consultando lotes disponibles...</p>
      ) : donations.length === 0 ? (
        <div className="mk-card mk-empty">No se encontraron alimentos con esos filtros.</div>
      ) : (
        <div className="mk-grid-3">
          {donations.map((item) => (
            <FoodCard
              key={item.id}
              donation={item}
              canRequest={user?.role === 'organization'}
              onRequest={(lot) => {
                setSelected(lot);
                setReqQty(String(Math.min(10, Number(lot.qty))));
              }}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mk-pagination">
          <button type="button" className="mk-btn mk-btn-outline mk-btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Anterior
          </button>
          <span>Página {pagination.page} de {pagination.totalPages}</span>
          <button type="button" className="mk-btn mk-btn-outline mk-btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
            Siguiente →
          </button>
        </div>
      )}

      {selected && (
        <div className="mk-modal-backdrop" role="dialog" aria-modal="true">
          <div className="mk-card mk-modal">
            <h3>Adquirir {selected.name}</h3>
            <p className="mk-muted">
              Disponible: {selected.qty} {selected.unit} · {selected.district}. Al confirmar se generará
              tu Ticket QR de recojo autorizado.
            </p>
            <form onSubmit={handleSubmitRequest} className="mk-form">
              <label>
                Cantidad a recoger ({selected.unit})
                <input
                  type="number"
                  min="1"
                  max={selected.qty}
                  step="0.5"
                  required
                  value={reqQty}
                  onChange={(e) => setReqQty(e.target.value)}
                />
              </label>
              <label>
                Mensaje para el donante
                <textarea
                  rows="3"
                  placeholder="Ej. Pasaremos a recoger a las 11:00 a. m."
                  value={reqMsg}
                  onChange={(e) => setReqMsg(e.target.value)}
                />
              </label>
              <div className="mk-form-actions">
                <button type="button" className="mk-btn mk-btn-outline" onClick={() => setSelected(null)}>
                  Cancelar
                </button>
                <button type="submit" className="mk-btn mk-btn-primary">
                  Confirmar y generar Ticket QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {generatedTicket && (
        <div className="mk-modal-backdrop" role="dialog" aria-modal="true">
          <div className="mk-card" style={{ width: 'min(760px, 95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>🎉 ¡Ticket de Recojo Generado!</h3>
              <button type="button" className="mk-assistant-close" onClick={() => setGeneratedTicket(null)}>
                ×
              </button>
            </div>
            <QrCertificateCard
              delivery={generatedTicket}
              authorizationMessage={`Organización ${generatedTicket.organization?.name || user?.name} autorizada para recoger ${generatedTicket.qty} ${generatedTicket.unit} de ${generatedTicket.donation?.name}. El donante también recibió este mismo código en su panel.`}
            />
          </div>
        </div>
      )}
    </section>
  );
}
