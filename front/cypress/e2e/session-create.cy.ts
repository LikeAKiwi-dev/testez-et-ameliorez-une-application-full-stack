/// <reference types="cypress" />

type User = {
  id: number;
};

type Teacher = {
  id: number;
  firstName: string;
  lastName: string;
};

describe('Session creation (admin)', () => {
  beforeEach(() => {
    cy.fixture('user-admin.json').as('adminUser');
    cy.fixture('teacher.json').as('teachers');
    cy.fixture('create-session-response.json').as('createResponse');
  });

  const loginAsAdmin = () => {
    cy.get('@adminUser').then((adminUser: unknown) => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: adminUser,
      }).as('login');
    });

    cy.intercept('GET', '**/api/session', { statusCode: 200, body: [] }).as('getSessions');

    cy.visit('/login');
    cy.get('input[formcontrolname="email"]').type('admin@yoga.com');
    cy.get('input[formcontrolname="password"]').type('password');
    cy.contains('button', 'Submit').click();

    cy.wait('@login');
    cy.wait('@getSessions');
    cy.url().should('include', '/sessions');
  };

  it('should create a session and go back to sessions list', () => {
    loginAsAdmin();

    cy.get('@teachers').then((teachers: unknown) => {
      cy.intercept('GET', '**/api/teacher', {
        statusCode: 200,
        body: teachers,
      }).as('getTeachers');
    });

    cy.contains('button', 'Create').click();
    cy.url().should('include', '/sessions/create');
    cy.wait('@getTeachers');

    cy.contains('button', 'Save').should('be.disabled');

    cy.get('input[formcontrolname="name"]').type('Morning Yoga');
    cy.get('input[formcontrolname="date"]').type('2026-01-15');

    cy.get('@teachers').then((teachers: unknown) => {
      const list = teachers as Teacher[];
      const t = list[0];

      cy.get('mat-select[formcontrolname="teacher_id"]').click();
      cy.contains('mat-option', `${t.firstName} ${t.lastName}`).click();
    });

    cy.get('textarea[formcontrolname="description"]').type('A gentle session');

    cy.get('@createResponse').then((createResponse: unknown) => {
      cy.intercept('POST', '**/api/session', {
        statusCode: 200,
        body: createResponse,
      }).as('createSession');
    });

    cy.intercept('GET', '**/api/session', {
      statusCode: 200,
      body: [],
    }).as('getSessionsAfterCreate');

    cy.contains('button', 'Save').should('not.be.disabled').click();

    cy.wait('@createSession');
    cy.wait('@getSessionsAfterCreate');

    cy.url().should('include', '/sessions');
  });
});
