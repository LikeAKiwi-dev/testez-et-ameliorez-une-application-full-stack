/// <reference types="cypress" />
describe('Login spec', () => {
  beforeEach(() => {
    cy.fixture('user-admin.json').as('userAdmin');
    cy.fixture('sessions.json').as('sessions');
  });

  it('Login successful', () => {
    cy.visit('/login');

    cy.get('@userAdmin').then((userAdmin: unknown) => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: userAdmin,
      }).as('login');
    });

    cy.get('@sessions').then((sessions: unknown) => {
      cy.intercept('GET', '/api/session', {
        statusCode: 200,
        body: sessions,
      }).as('sessions');
    });

    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type(`test!1234`);

    cy.contains('button', 'Submit').click();

    cy.wait('@login');
    cy.wait('@sessions');

    cy.url().should('include', '/sessions');
  });
});
