import React, { useEffect, useRef, useState } from 'react';
import { verifyCertificateCode, confirmDeliveryRequest } from '../services/api';
import QrCertificateCard from './QrCertificateCard';

export default function TicketValidator({ allowConfirm = false, onConfirmed, onToast }) {
  const [code, setCode] = useState('MK-CUS-2026-0002');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  useEffect(() => () => stopCamera(), []);

  async function validateCode(targetCode) {
    const clean = String(targetCode ?? code).trim().toUpperCase();
    if (!clean) return;
    setError('');
    setResult(null);
    try {
      const res = await verifyCertificateCode(clean);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.error || 'Código no encontrado. No autorices la entrega.');
    }
  }

  async function handleConfirm(deliveryId) {
    try {
      await confirmDeliveryRequest(deliveryId);
      onToast?.('✅ Entrega confirmada. El ticket ahora figura como ENTREGADO.');
      await validateCode(result?.data?.certificate_code || code);
      onConfirmed?.();
    } catch (err) {
      onToast?.(err.response?.data?.error || 'No se pudo confirmar la entrega.');
    }
  }

  async function startCameraScan() {
    if (!('BarcodeDetector' in window)) {
      onToast?.('Tu navegador no soporta lectura directa por cámara. Ingresa el código del ticket manualmente.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const tick = async () => {
            if (!streamRef.current || !videoRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0 && codes[0].rawValue) {
                const found = codes[0].rawValue.trim();
                setCode(found);
                stopCamera();
                validateCode(found);
                return;
              }
            } catch {}
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }, 150);
    } catch {
      onToast?.('No se pudo acceder a la cámara. Ingresa el código manualmente.');
      stopCamera();
    }
  }

  return (
    <div className="mk-card">
      <span className="mk-eyebrow">LECTOR Y VALIDADOR DE TICKETS DE RECOJO</span>
      <h3>Verificar autorización de entrega</h3>
      <p className="mk-muted">
        Escanea el código QR del ticket que muestra quien recoge o escribe el código (prueba con{' '}
        <code>MK-CUS-2026-0002</code> pendiente o <code>MK-CUS-2026-0001</code> confirmada).
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          validateCode(code);
        }}
        className="mk-toolbar"
      >
        <input
          type="text"
          required
          aria-label="Código de ticket QR"
          placeholder="Ej. MK-CUS-2026-0002"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" className="mk-btn mk-btn-primary">
          Validar autorización
        </button>
        {!scanning ? (
          <button type="button" className="mk-btn mk-btn-ghost" onClick={startCameraScan}>
            📷 Leer QR con cámara
          </button>
        ) : (
          <button type="button" className="mk-btn mk-btn-outline" onClick={stopCamera}>
            Detener cámara
          </button>
        )}
      </form>

      {scanning && (
        <div className="mk-scanner-box">
          <video ref={videoRef} playsInline muted className="mk-scanner-video" />
          <small className="mk-muted">Apunta la cámara al código QR del ticket...</small>
        </div>
      )}

      {error && (
        <div className="mk-alert mk-alert-error" role="alert">
          ❌ {error}
        </div>
      )}

      {result?.data && (
        <QrCertificateCard
          delivery={result.data}
          authorizationMessage={result.authorization_message}
          onConfirmDelivery={allowConfirm ? handleConfirm : null}
        />
      )}
    </div>
  );
}
