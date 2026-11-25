import React from 'react';
import { getFoodImage, getExpiryBadge, STATUS_LABELS } from '../utils/foodHelpers';

export default function FoodCard({ donation, canRequest, onRequest, onEdit, onRetire }) {
  const badge = getExpiryBadge(donation.expiry);
  const imgSrc = donation.photo_data || getFoodImage(donation.image);

  return (
    <article className="mk-food-card" data-testid="food-card">
      <div className={`mk-food-media ${donation.photo_data ? 'has-photo' : ''}`}>
        <img src={imgSrc} alt={donation.name} loading="lazy" />
        <span className={`mk-pill mk-pill-${badge.tone}`}>{badge.label}</span>
      </div>

      <div className="mk-food-body">
        <div className="mk-food-meta-top">
          <span className="mk-eyebrow">{donation.category}</span>
          <span className="mk-status-tag">{STATUS_LABELS[donation.status] || donation.status}</span>
        </div>

        <h3>{donation.name}</h3>
        <p className="mk-muted">{donation.description || 'Excedente alimentario disponible en Cusco.'}</p>

        <div className="mk-food-specs">
          <div>
            <small>Disponible</small>
            <strong>
              {donation.qty} {donation.unit}
            </strong>
          </div>
          <div>
            <small>Distrito</small>
            <strong>{donation.district}</strong>
          </div>
          <div>
            <small>Lote</small>
            <strong>{donation.lot || '—'}</strong>
          </div>
        </div>

        <div className="mk-food-footer">
          <small className="mk-muted">
            {donation.owner?.name || donation.place || 'Red Solidaria Cusco'}
          </small>
          <div className="mk-row-actions">
            {canRequest && donation.status === 'available' && (
              <button
                type="button"
                className="mk-btn mk-btn-primary mk-btn-sm"
                onClick={() => onRequest(donation)}
              >
                Adquirir / Solicitar
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                className="mk-btn mk-btn-ghost mk-btn-sm"
                onClick={() => onEdit(donation)}
              >
                Editar
              </button>
            )}
            {onRetire && donation.status === 'available' && (
              <button
                type="button"
                className="mk-btn mk-btn-outline mk-btn-sm"
                onClick={() => onRetire(donation.id)}
              >
                Retirar
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
