import React from 'react';
import TicketValidator from '../components/TicketValidator';

export default function VerifyPage({ user, onToast }) {
  const allowConfirm = user && ['donor', 'admin', 'organization'].includes(user.role);
  return (
    <section className="mk-section">
      <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
        <TicketValidator allowConfirm={Boolean(allowConfirm)} onToast={onToast} />
      </div>
    </section>
  );
}
