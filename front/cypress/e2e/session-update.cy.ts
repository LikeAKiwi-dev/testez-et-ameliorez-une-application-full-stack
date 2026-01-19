/// <reference types="cypress" />
describe('Session update (admin)', () => {
  beforeEach(() => {
    cy.fixture('user-admin.json').as('adminUser');
    cy.fixture('teacher.json').as('teachers');
    cy.fixture('sessions.json').as('sessions');
    cy.fixture('session-updated.json').as('updatedSession');
  });

  const loginAsAdmin = () => {
    cy.get('@adminUser').then((adminUser: any) => {
      cy.intercept('POST', '**/api/auth/login', { statusCode: 200, body: adminUser }).as('login');
    });

    cy.get('@sessions').then((sessions: any) => {
      cy.intercept('GET', '**/api/session', { statusCode: 200, body: sessions }).as('getSessions');
    });

    cy.visit('/login');
    cy.get('input[formcontrolname="email"]').type('admin@yoga.com');
    cy.get('input[formcontrolname="password"]').type('password');
    cy.contains('button', 'Submit').click();

    cy.wait('@login');
    cy.wait('@getSessions');
    cy.url().should('include', '/sessions');
  };

  it('should update a session and go back to sessions list', () => {
    loginAsAdmin();

    cy.get('@teachers').then((teachers: any) => {
      cy.intercept('GET', '**/api/teacher', { statusCode: 200, body: teachers }).as('getTeachers');
    });

    cy.get('@sessions').then((sessions: any) => {
      const sessionId = sessions[0].id;
      cy.intercept('GET', `**/api/session/${sessionId}`, { statusCode: 200, body: sessions[0] }).as('getSessionDetail');

      cy.contains('button', 'Edit').click();
      cy.url().should('include', `/sessions/update/${sessionId}`);

      cy.wait('@getTeachers');
      cy.wait('@getSessionDetail');

      cy.get('input[formcontrolname="name"]').clear().type('Power Yoga');

      cy.get('@updatedSession').then((updatedSession: any) => {
        cy.intercept('PUT', `**/api/session/${sessionId}`, { statusCode: 200, body: updatedSession }).as('updateSession');

        cy.intercept('GET', '**/api/session', { statusCode: 200, body: [updatedSession] }).as('getSessionsAfterUpdate');
      });

      cy.contains('button', 'Save').click();

      cy.wait('@updateSession');
      cy.wait('@getSessionsAfterUpdate');

      cy.url().should('include', '/sessions');
      cy.contains('Power Yoga').should('exist');
    });
  });
});
