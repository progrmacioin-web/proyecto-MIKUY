import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VirtualAssistant from '../../components/VirtualAssistant';
import * as api from '../../services/api';

describe('Pruebas de Integración Frontend — Asistente Virtual Ukumari (Semana 15)', () => {
  test('abre el panel, envía una pregunta a /api/assistant y muestra la respuesta', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'askAssistant').mockResolvedValueOnce({
      reply: 'En Wanchaq hay 3 lotes disponibles ahora.',
      mood: 'pointing',
      poweredBy: 'Gemini AI',
      actions: [{ label: 'Explorar Catálogo', page: 'catalog' }],
    });

    render(<VirtualAssistant user={null} page="home" onNavigate={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /Abrir asistente Ukumari/i }));
    const input = screen.getByLabelText(/Escribe tu pregunta a Ukumari/i);
    await user.type(input, '¿Qué lotes hay en Wanchaq?');
    await user.click(screen.getByRole('button', { name: /^Enviar$/i }));

    expect(api.askAssistant).toHaveBeenCalled();
    expect(await screen.findByText(/En Wanchaq hay 3 lotes disponibles ahora/i)).toBeVisible();
  });
});
