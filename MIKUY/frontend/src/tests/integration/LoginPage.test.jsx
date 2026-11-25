import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../pages/LoginPage';
import * as api from '../../services/api';

describe('Pruebas de Integración Frontend — LoginPage (Vitest + Testing Library — Semana 15)', () => {
  test('permite iniciar sesión y llama a onLoginSuccess cuando la API responde OK', async () => {
    const user = userEvent.setup();
    const onLoginSuccess = vi.fn();
    vi.spyOn(api, 'loginRequest').mockResolvedValueOnce({
      token: 'jwt-demo-token',
      user: { id: 1, name: 'Mercado San Pedro', role: 'donor', district: 'Cusco' },
    });

    render(<LoginPage onLoginSuccess={onLoginSuccess} onNavigate={vi.fn()} />);

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'donante@mikuy.demo');
    await user.type(screen.getByLabelText(/Contraseña/i), 'Mikuy2026!');
    await user.click(screen.getByRole('button', { name: /^Ingresar$/i }));

    expect(api.loginRequest).toHaveBeenCalledWith('donante@mikuy.demo', 'Mikuy2026!');
    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'donor' }),
      'jwt-demo-token'
    );
  });

  test('muestra alerta visible cuando la API rechaza las credenciales', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'loginRequest').mockRejectedValueOnce({
      response: { data: { error: 'Credenciales inválidas o cuenta inactiva.' } },
    });

    render(<LoginPage onLoginSuccess={vi.fn()} onNavigate={vi.fn()} />);

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'malo@mikuy.demo');
    await user.type(screen.getByLabelText(/Contraseña/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /^Ingresar$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas');
  });
});
