import React, { useState } from 'react';
import { updateProfileRequest } from '../services/api';
import { compressImageFile } from '../utils/imageUpload';

const DISTRICTS = ['Cusco', 'Santiago', 'Wanchaq', 'San Sebastián', 'San Jerónimo', 'Poroy', 'Saylla'];

export default function ProfileEditor({ user, onUserUpdated, onToast }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    organization: user?.organization || '',
    district: user?.district || 'Cusco',
    phone: user?.phone || '',
    public_description: user?.public_description || '',
    photo_data: user?.photo_data || '',
  });
  const [saving, setSaving] = useState(false);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 420, 0.8);
      setForm((prev) => ({ ...prev, photo_data: compressed }));
      onToast?.('Foto cargada. Haz clic en "Guardar perfil" para confirmar.');
    } catch (err) {
      onToast?.(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfileRequest(form);
      onUserUpdated?.(res.user);
      onToast?.('¡Perfil y fotografía guardados en MySQL!');
    } catch (err) {
      onToast?.(err.response?.data?.error || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mk-card">
      <div className="mk-profile-head">
        <div className="mk-avatar-lg">
          {form.photo_data ? (
            <img src={form.photo_data} alt={form.name} />
          ) : (
            <span>{(form.name || 'M').slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div>
          <span className="mk-eyebrow">MI PERFIL · EDITAR DATOS Y FOTO</span>
          <h3 style={{ margin: '4px 0' }}>{user.email}</h3>
          <label className="mk-btn mk-btn-ghost mk-btn-sm" style={{ display: 'inline-block', cursor: 'pointer' }}>
            📷 Subir / Cambiar foto de perfil
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handlePhotoChange} />
          </label>
          {form.photo_data && (
            <button
              type="button"
              className="mk-btn mk-btn-outline mk-btn-sm"
              style={{ marginLeft: 8 }}
              onClick={() => setForm((p) => ({ ...p, photo_data: '' }))}
            >
              Quitar foto
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mk-form-grid">
        <label>
          Nombre completo / Comercial
          <input required minLength={3} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Organización / Comercio
          <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
        </label>
        <label>
          Distrito de Cusco
          <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}>
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Teléfono / WhatsApp de contacto
          <input placeholder="+51 984 ..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="full">
          Descripción pública
          <textarea
            rows="3"
            placeholder="Describe tu comercio, comedor popular o albergue..."
            value={form.public_description}
            onChange={(e) => setForm({ ...form, public_description: e.target.value })}
          />
        </label>
        <div className="full">
          <button type="submit" className="mk-btn mk-btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </div>
      </form>
    </div>
  );
}
