describe('MIKUY — Pruebas Funcionales E2E (Cypress — Semana 15)', () => {
  it('Carga la portada, navega al catálogo y verifica una constancia QR', () => {
    cy.visit('/');
    cy.contains('Cada alimento encuentra su mesa.').should('be.visible');

    cy.contains('button', 'Catálogo').click();
    cy.contains('Alimentos disponibles en Cusco').should('be.visible');

    cy.contains('button', 'Verificar QR').click();
    cy.contains('button', 'Consultar en MySQL').click();
    cy.contains('MK-CUS-2026-0001').should('be.visible');
  });

  it('Inicia sesión como Administrador y abre el Laboratorio de Optimización EXPLAIN', () => {
    cy.visit('/');
    cy.contains('button', 'Ingresar').click();
    cy.get('#login-email').type('admin@mikuy.demo');
    cy.get('#login-password').type('Mikuy2026!');
    cy.contains('button', 'Ingresar').click();

    cy.contains('CENTRO DE CONTROL ADMINISTRATIVO').should('be.visible');
    cy.contains('button', 'Laboratorio Optimización').click();
    cy.contains('REDUCCIÓN DE QUERIES').should('be.visible');
  });
});
