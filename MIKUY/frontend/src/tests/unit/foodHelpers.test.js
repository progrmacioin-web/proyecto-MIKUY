import { describe, test, expect } from 'vitest';
import {
  getDaysLeft,
  getExpiryBadge,
  filterCatalogItems,
  formatRole,
  buildDeterministicQrPattern,
} from '../../utils/foodHelpers';

describe('Pruebas Unitarias Frontend (Vitest — Semana 15)', () => {
  test('calcula días restantes y etiqueta de vencimiento', () => {
    const ref = new Date('2026-11-24T10:00:00');
    expect(getDaysLeft('2026-11-26', ref)).toBe(3);
    expect(getExpiryBadge('2026-11-26', ref).tone).toBe('warning');
    expect(getExpiryBadge('2026-11-20', ref).label).toBe('Vencido');
  });

  test('filtra correctamente el catálogo por texto, distrito y categoría', () => {
    const lots = [
      { id: 1, name: 'Papa nativa', district: 'Cusco', category: 'Tubérculos' },
      { id: 2, name: 'Zanahoria fresca', district: 'Wanchaq', category: 'Verduras' },
    ];
    expect(filterCatalogItems(lots, { q: 'papa' })).toHaveLength(1);
    expect(filterCatalogItems(lots, { district: 'Wanchaq' })[0].id).toBe(2);
    expect(filterCatalogItems(lots, { category: 'Frutas' })).toHaveLength(0);
  });

  test('formatea roles institucionales en español', () => {
    expect(formatRole('donor')).toBe('Donante');
    expect(formatRole('organization')).toBe('Organización beneficiaria');
    expect(formatRole('admin')).toBe('Administrador');
  });

  test('genera una matriz QR 11x11 determinística para el código de entrega', () => {
    const qr1 = buildDeterministicQrPattern('MK-CUS-2026-0001');
    const qr2 = buildDeterministicQrPattern('MK-CUS-2026-0001');
    expect(qr1).toHaveLength(11);
    expect(qr1).toEqual(qr2);
  });
});
