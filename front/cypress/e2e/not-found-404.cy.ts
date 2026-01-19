/// <reference types="cypress" />

describe('404 - Not Found', () => {
  it('should redirect to /404 when route does not exist', () => {
    cy.visit('/this-route-does-not-exist', { failOnStatusCode: false });

    cy.url().should('include', '/404');
    cy.contains('h1', /page not found/i).should('be.visible');
  });
});
