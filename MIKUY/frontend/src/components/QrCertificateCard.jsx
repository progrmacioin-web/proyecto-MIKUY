import React from 'react';
import { buildDeterministicQrPattern, STATUS_LABELS } from '../utils/foodHelpers';

export default function QrCertificateCard({ delivery, authorizationMessage, onConfirmDelivery }) {
  if (!delivery) return null;
  const grid = buildDeterministicQrPattern(delivery.certificate_code);
  const isConfirmed = delivery.status === 'confirmed';

  return (
    <section className="mk-cert-card" id="printable-certificate">
      <div className="mk-cert-info">
        <span className="mk-eyebrow">TICKET DE RECOJO AUTORIZADO · MIKUY CUSCO</span>
        <h3>Código: {delivery.certificate_code}</h3>

        {authorizationMessage && (
          <div className={`mk-auth-banner ${isConfirmed ? 'is-done' : 'is-ready'}`}>
            <strong>{isConfirmed ? '✅ ENTREGA COMPLETADA' : '✅ ORGANIZACIÓN AUTORIZADA PARA RECOJO'}</strong>
            <p>{authorizationMessage}</p>
          </div>
        )}

        <p>
          <strong>Alimento:</strong> {delivery.donation?.name || `Lote #${delivery.donation_id}`}
        </p>
        <p>
          <strong>Cantidad autorizada:</strong> {delivery.qty} {delivery.unit}
        </p>
        <p>
          <strong>Organización que recoge:</strong>{' '}
          {delivery.organization?.name || `Org #${delivery.organization_id}`}{' '}
          {delivery.organization?.district ? `(${delivery.organization.district})` : ''}
        </p>
        <p>
          <strong>PIN de seguridad:</strong>{' '}
          <code className="mk-pin-code">{delivery.pickup_pin || '102030'}</code>
        </p>
        <p>
          <strong>Punto de recojo:</strong> {delivery.pickup_place || delivery.donation?.district || 'Cusco'}
        </p>
        <p>
          <strong>Estado:</strong>{' '}
          <span className="mk-pill mk-pill-ok">{STATUS_LABELS[delivery.status] || delivery.status}</span>
        </p>

        <div className="mk-row-actions no-print" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="mk-btn mk-btn-outline mk-btn-sm"
            onClick={() => window.print()}
          >
            🖨️ Imprimir / Guardar PDF
          </button>
          {onConfirmDelivery && delivery.status === 'scheduled' && (
            <button
              type="button"
              className="mk-btn mk-btn-primary mk-btn-sm"
              onClick={() => onConfirmDelivery(delivery.id)}
            >
              ✅ Confirmar Entrega Realizada
            </button>
          )}
        </div>
      </div>

      <div className="mk-qr-box" aria-label={`Código QR ${delivery.certificate_code}`}>
        <svg viewBox="0 0 110 110" width="144" height="144" role="img">
          <rect width="110" height="110" fill="#ffffff" rx="8" />
          {grid.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect key={`${r}-${c}`} x={6 + c * 9} y={6 + r * 9} width="8" height="8" fill="#16203d" />
              ) : null
            )
          )}
        </svg>
        <code>{delivery.certificate_code}</code>
        <small className="mk-muted">Muestra este ticket al donante al recoger</small>
      </div>
    </section>
  );
}
