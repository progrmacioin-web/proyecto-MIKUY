import React, { useEffect, useRef, useState } from 'react';
import { fetchMessages, sendMessageRequest } from '../services/api';

export default function RequestChatModal({ requestItem, currentUser, onClose, onToast }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  async function loadMessages() {
    try {
      const res = await fetchMessages(requestItem.id);
      setMessages(res.data || []);
    } catch {
      onToast?.('No se pudieron cargar los mensajes.');
    }
  }

  useEffect(() => {
    loadMessages();
    const timer = setInterval(loadMessages, 5000);
    return () => clearInterval(timer);
  }, [requestItem.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await sendMessageRequest(requestItem.id, text.trim());
      setMessages((prev) => [...prev, res.data]);
      setText('');
    } catch (err) {
      onToast?.(err.response?.data?.error || 'Error al enviar el mensaje.');
    } finally {
      setSending(false);
    }
  }

  const counterpart =
    currentUser.role === 'donor'
      ? requestItem.organization?.name || 'Organización'
      : requestItem.donation?.owner?.name || 'Donante';

  return (
    <div className="mk-modal-backdrop" role="dialog" aria-modal="true" aria-label="Mensajería interna">
      <div className="mk-card mk-chat-modal">
        <header className="mk-chat-head">
          <div>
            <span className="mk-eyebrow">MENSAJERÍA INTERNA · MIKUY</span>
            <h3 style={{ margin: '2px 0' }}>
              {counterpart} · {requestItem.donation?.name}
            </h3>
            <small className="mk-muted">
              Ticket: {requestItem.delivery?.certificate_code || 'En coordinación'} ({requestItem.qty}{' '}
              {requestItem.donation?.unit})
            </small>
          </div>
          <button type="button" className="mk-assistant-close" onClick={onClose} aria-label="Cerrar chat">
            ×
          </button>
        </header>

        <div className="mk-chat-stream" ref={scrollRef}>
          {messages.length === 0 ? (
            <p className="mk-muted" style={{ textAlign: 'center', marginTop: 24 }}>
              Inicia la conversación para coordinar hora y punto de entrega.
            </p>
          ) : (
            messages.map((m) => {
              const own = m.sender_id === currentUser.id;
              return (
                <div key={m.id} className={`mk-msg ${own ? 'mk-msg-user' : 'mk-msg-bot'}`}>
                  <small className="mk-muted" style={{ fontSize: 10 }}>
                    {own ? 'Tú' : m.sender?.name || counterpart}
                  </small>
                  <div className="mk-msg-bubble">{m.body}</div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSend} className="mk-assistant-form">
          <input
            type="text"
            placeholder="Escribe un mensaje para coordinar el recojo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={600}
          />
          <button type="submit" className="mk-btn mk-btn-primary mk-btn-sm" disabled={sending || !text.trim()}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
