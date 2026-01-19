/// <reference types="cypress" />

type LoginUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  admin: boolean;
};

type Teacher = {
  id: number;
  firstName: string;
  lastName: string;
};

type Session = {
  id: number;
  name: string;
  description: string;
  date: string;
  teacher_id: number;
};

declare global {
  namespace Cypress {
    interface Chainable {
      loginWithIntercept(user: LoginUser): Chainable<void>;
      mockSessionsList(sessions: Session[]): Chainable<void>;
      mockTeachers(teachers: Teacher[]): Chainable<void>;
    }
  }
}

// @ts-ignore
Cypress.Commands.add('mockSessionsList', (sessions: Session[]) => {
  cy.intercept('GET', '**/api/session', {
    statusCode: 200,
    body: sessions,
  }).as('getSessions');
});

Cypress.Commands.add('mockTeachers', (teachers: Teacher[]) => {
  cy.intercept('GET', '**/api/teacher', {
    statusCode: 200,
    body: teachers,
  }).as('getTeachers');
});

Cypress.Commands.add('loginWithIntercept', (user: LoginUser) => {
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: user,
  }).as('login');

  cy.visit('/login');

  cy.get('input[formcontrolname="email"]').type('test@test.com');
  cy.get('input[formcontrolname="password"]').type('test!1234');

  cy.contains('button', 'Submit').click();
  cy.wait('@login');

  cy.url().should('include', '/sessions');
});

export {};
