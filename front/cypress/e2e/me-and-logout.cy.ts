/// <reference types="cypress" />
describe('Account page (/me) and logout', () => {
  beforeEach(() => {
    cy.fixture('user-admin.json').as('adminUser');
    cy.fixture('user-user.json').as('normalUser');
    cy.fixture('me-admin.json').as('meAdmin');
    cy.fixture('me-user.json').as('meUser');
  });

  const loginAs = (userAlias: 'adminUser' | 'normalUser') => {
    cy.get(`@${userAlias}`).then((user: any) => {
      cy.intercept('POST', '**/api/auth/login', { statusCode: 200, body: user }).as('login');
    });

    cy.intercept('GET', '**/api/session', { statusCode: 200, body: [] }).as('getSessions');

    cy.visit('/login');
    cy.get('input[formcontrolname="email"]').type('user@yoga.com');
    cy.get('input[formcontrolname="password"]').type('password');
    cy.contains('button', 'Submit').click();

    cy.wait('@login');
    cy.wait('@getSessions');
    cy.url().should('include', '/sessions');
  };

  it('should display account info for admin and allow logout', () => {
    loginAs('adminUser');

    cy.get('@adminUser').then((u: any) => {
      cy.get('@meAdmin').then((me: any) => {
        cy.intercept('GET', `**/api/user/${u.id}`, { statusCode: 200, body: me }).as('getMe');
      });
    });

    cy.contains('span', 'Account').click();
    cy.url().should('include', '/me');

    cy.wait('@getMe');
    cy.contains('h1', 'User information').should('exist');
    cy.contains('You are admin').should('exist');

    cy.contains('span', 'Logout').click();
    cy.url().should('include', '/login');
    cy.contains('button', 'Submit').should('exist');
  });

  it('should allow a non-admin to delete their account (API call + redirect)', () => {
    loginAs('normalUser');

    cy.get('@normalUser').then((u: any) => {
      cy.get('@meUser').then((me: any) => {
        cy.intercept('GET', `**/api/user/${u.id}`, { statusCode: 200, body: me }).as('getMe');
      });

      cy.intercept('DELETE', `**/api/user/${u.id}`, { statusCode: 200, body: {} }).as('deleteMe');
    });

    cy.contains('span', 'Account').click();
    cy.url().should('include', '/me');

    cy.wait('@getMe');

    cy.contains('Delete my account:').should('exist');
    cy.contains('button', 'Detail').click();

    cy.wait('@deleteMe');

    cy.url().should('include', '/login');
  });
});
