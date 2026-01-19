/// <reference types="cypress" />
describe('Sessions list page', () => {
  beforeEach(() => {
    cy.fixture('sessions.json').as('sessions');
    cy.fixture('user-admin.json').as('adminUser');
    cy.fixture('user-user.json').as('normalUser');
  });

  const loginAs = (userAlias: 'adminUser' | 'normalUser') => {
    cy.get(`@${userAlias}`).then((user: any) => {
      cy.intercept('POST', '**/api/auth/login', { statusCode: 200, body: user }).as('login');
    });

    cy.get('@sessions').then((sessions) => {
      cy.intercept('GET', '**/api/session', { statusCode: 200, body: sessions }).as('getSessions');
    });

    cy.visit('/login');
    cy.get('input[formcontrolname="email"]').type('test@test.com');
    cy.get('input[formcontrolname="password"]').type('password');
    cy.contains('button', 'Submit').click();

    cy.wait('@login');
    cy.wait('@getSessions');

    cy.url().should('include', '/sessions');
  };

  it('should show Create and Edit buttons when user is admin', () => {
    loginAs('adminUser');

    cy.contains('Rentals available').should('exist');
    cy.contains('Yoga').should('exist');

    cy.contains('button', 'Create').should('exist');
    cy.contains('button', 'Edit').should('exist');
    cy.contains('button', 'Detail').should('exist');
  });

  it('should hide Create and Edit buttons when user is not admin, but still show Detail', () => {
    loginAs('normalUser');

    cy.contains('Rentals available').should('exist');
    cy.contains('Yoga').should('exist');

    cy.contains('button', 'Create').should('not.exist');
    cy.contains('button', 'Edit').should('not.exist');
    cy.contains('button', 'Detail').should('exist');
  });
});
