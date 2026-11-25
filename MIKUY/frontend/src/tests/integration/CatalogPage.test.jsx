import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CatalogPage from '../../pages/CatalogPage';
import * as api from '../../services/api';

describe('Pruebas de Integración Frontend — CatalogPage (Testing Library — Semana 15)', () => {
  test('renderiza tarjetas de alimentos consumidas desde la API REST', async () => {
    vi.spyOn(api, 'fetchDonations').mockResolvedValueOnce({
      data: [
        {
          id: 101,
          name: 'Papa nativa',
          description: 'Jabas limpias en Mercado San Pedro',
          category: 'Tubérculos',
          qty: 35,
          unit: 'kg',
          expiry: '2027-01-15',
          district: 'Cusco',
          status: 'available',
          image: 'potato',
          lot: 'PN-101',
        },
      ],
      pagination: { page: 1, totalPages: 1, total: 1 },
    });

    render(<CatalogPage user={{ id: 2, role: 'organization' }} onToast={vi.fn()} />);

    expect(await screen.findByText('Papa nativa')).toBeVisible();
    expect(screen.getByRole('button', { name: /Solicitar/i })).toBeVisible();
  });
});
