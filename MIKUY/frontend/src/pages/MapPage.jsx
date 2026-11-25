import React, { useState } from 'react';
import CuscoMap from '../components/CuscoMap';

export default function MapPage({ donations = [] }) {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const filtered = donations.filter(
    (d) => d.status === 'available' && (!selectedDistrict || d.district === selectedDistrict)
  );

  return (
    <section className="mk-section">
      <div className="mk-section-head">
        <div>
          <span className="mk-eyebrow">TERRITORIO · PROVINCIA DEL CUSCO</span>
          <h2>Mapa interactivo de donaciones</h2>
        </div>
        {selectedDistrict && (
          <button type="button" className="mk-btn mk-btn-ghost mk-btn-sm" onClick={() => setSelectedDistrict('')}>
            Mostrar todos los distritos
          </button>
        )}
      </div>

      <div className="mk-map-layout">
        <div className="mk-card" style={{ padding: 12 }}>
          <CuscoMap donations={donations} onSelectDistrict={setSelectedDistrict} />
        </div>
        <aside className="mk-card">
          <h3>{selectedDistrict ? `Lotes en ${selectedDistrict}` : 'Todos los lotes activos'}</h3>
          <p className="mk-muted">{filtered.length} publicaciones disponibles</p>
          <ul className="mk-list">
            {filtered.map((d) => (
              <li key={d.id}>
                <strong>{d.name}</strong>
                <span>
                  {d.qty} {d.unit} · {d.district}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
