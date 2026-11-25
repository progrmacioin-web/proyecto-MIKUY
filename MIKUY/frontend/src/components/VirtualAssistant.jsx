import React, { useEffect, useRef, useState } from 'react';
import { askAssistant } from '../services/api';

const MASCOT_IMAGES = {
  idle: '/assets/images/ukumari-idle.svg',
  hello: '/assets/images/ukumari-hello.svg',
  thinking: '/assets/images/ukumari-thinking.svg',
  talking: '/assets/images/ukumari-talking.svg',
  pointing: '/assets/images/ukumari-pointing.svg',
  celebrate: '/assets/images/ukumari-celebrate.svg',
  confused: '/assets/images/ukumari-confused.svg',
};

const QUICK_PROMPTS = [
  '¿Qué alimentos hay disponibles hoy?',
  '¿Cómo funciona el ticket QR de recojo?',
  '¿Cómo subo fotos o edito mi perfil?',
  'Verificar MK-CUS-2026-0002',
];

export default function VirtualAssistant({ user, page, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState('hello');
  const [poweredBy, setPoweredBy] = useState('Gemini AI · MIKUY');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '¡Hola! Soy Ukumari, tu asistente virtual de MIKUY impulsado por IA. Pregúntame sobre alimentos en Cusco, cómo donar/editar productos, mensajería interna o tickets QR de recojo.',
      actions: [
        { label: 'Explorar Catálogo', page: 'catalog' },
        { label: 'Validar Ticket QR', page: 'verify' },
      ],
    },
  ]);

  const listRef = useRef(null);
  const role = user?.role || 'visitor';

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, loading]);

  async function sendMessage(textToSend) {
    const clean = String(textToSend ?? input).trim();
    if (!clean || loading) return;

    const history = messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text }));
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: clean }]);
    setInput('');
    setLoading(true);
    setMood('thinking');

    try {
      const data = await askAssistant(clean, { role, page }, history);
      setMood(data.mood || 'talking');
      if (data.poweredBy) setPoweredBy(data.poweredBy);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, sender: 'bot', text: data.reply, actions: data.actions || [] },
      ]);
    } catch {
      setMood('confused');
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          sender: 'bot',
          text: 'No pude conectarme con el backend en este momento. Verifica que Laravel esté corriendo (php artisan serve en puerto 8000).',
          actions: [{ label: 'Explorar Catálogo', page: 'catalog' }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="mk-assistant-root no-print" aria-label="Asistente virtual Ukumari">
      {open && (
        <section className="mk-assistant-panel" role="dialog" aria-label="Chat con Ukumari">
          <header className="mk-assistant-head">
            <div className="mk-assistant-title">
              <img src={MASCOT_IMAGES[mood] || MASCOT_IMAGES.idle} alt="Ukumari" />
              <div>
                <strong>Ukumari · Asistente MIKUY</strong>
                <small>{loading ? 'Pensando...' : poweredBy}</small>
              </div>
            </div>
            <button type="button" className="mk-assistant-close" onClick={() => setOpen(false)} aria-label="Cerrar">
              ×
            </button>
          </header>

          <div className="mk-assistant-messages" ref={listRef} role="log" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={`mk-msg mk-msg-${m.sender}`}>
                <div className="mk-msg-bubble">{m.text}</div>
                {m.actions?.length > 0 && (
                  <div className="mk-msg-actions">
                    {m.actions.map((act, idx) => (
                      <button
                        key={`${m.id}-${idx}`}
                        type="button"
                        className="mk-chip-action"
                        onClick={() => {
                          onNavigate?.(act.page);
                          setOpen(false);
                        }}
                      >
                        {act.label} ↗
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="mk-msg mk-msg-bot">
                <div className="mk-msg-bubble mk-typing">Ukumari está consultando...</div>
              </div>
            )}
          </div>

          <div className="mk-assistant-suggestions">
            {QUICK_PROMPTS.map((q) => (
              <button key={q} type="button" className="mk-suggestion-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          <form
            className="mk-assistant-form"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              aria-label="Escribe tu pregunta a Ukumari"
              placeholder="Pregunta sobre lotes, tickets QR o perfiles..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={400}
            />
            <button type="submit" className="mk-btn mk-btn-primary mk-btn-sm" disabled={loading || !input.trim()}>
              Enviar
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="mk-assistant-fab"
        aria-label={open ? 'Cerrar asistente Ukumari' : 'Abrir asistente Ukumari'}
        onClick={() => {
          setOpen((v) => !v);
          setMood('hello');
        }}
      >
        <img src={MASCOT_IMAGES[open ? mood : 'idle']} alt="Ukumari" />
        <span className="mk-assistant-badge">¿Te ayudo?</span>
      </button>
    </aside>
  );
}
