/// <reference types="cypress" />
describe('Session detail page (via UI navigation)', () => {
  beforeEach(() => {
    cy.fixture('user-admin.json').as('adminUser');
    cy.fixture('user-user.json').as('normalUser');
    cy.fixture('teacher.json').as('teachers');
    cy.fixture('sessions.json').as('sessions');
  });

  const loginAs = (userAlias: 'adminUser' | 'normalUser') => {
    cy.get(`@${userAlias}`).then((user: any) => {
      cy.intercept('POST', '**/api/auth/login', { statusCode: 200, body: user }).as('login');
    });

    cy.get('@sessions').then((sessions: any) => {
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

  const openDetailAndMockApis = (users: number[]) => {
    cy.get('@sessions').then((sessions: any) => {
      const s = { ...sessions[0], users };
      const sessionId = s.id;

      cy.intercept('GET', `**/api/session/${sessionId}`, { statusCode: 200, body: s }).as('getSession');

      cy.get('@teachers').then((teachers: any) => {
        const t = teachers[0];
        cy.intercept('GET', `**/api/teacher/${t.id}`, { statusCode: 200, body: t }).as('getTeacher');
      });

      cy.contains('button', 'Detail').first().click();
      cy.url().should('include', `/sessions/detail/${sessionId}`);

      cy.wait('@getSession');
      cy.wait('@getTeacher');
    });
  };

  it('admin: should show Delete button', () => {
    loginAs('adminUser');
    openDetailAndMockApis([2, 3]);

    cy.contains('button', 'Delete').should('exist');
  });

  it('non-admin: should show Participate when NOT participating', () => {
    loginAs('normalUser');

    cy.get('@normalUser').then((user: any) => {

      const usersNotParticipating = [1, 3, 4].filter((id) => id !== user.id);

      openDetailAndMockApis(usersNotParticipating);

      cy.contains('button', 'Participate').should('exist');
      cy.contains('button', 'Do not participate').should('not.exist');
      cy.contains('button', 'Delete').should('not.exist');
    });
  });


  it('non-admin: should show Do not participate when participating', () => {
    loginAs('normalUser');

    cy.get('@normalUser').then((user: any) => {
      openDetailAndMockApis([user.id, 9]);
      cy.contains('button', 'Do not participate').should('exist');
      cy.contains('button', 'Participate').should('not.exist');
      cy.contains('button', 'Delete').should('not.exist');
    });
  });

  it('admin: should delete and go back to sessions list', () => {
    loginAs('adminUser');
    openDetailAndMockApis([2, 3]);

    cy.get('@sessions').then((sessions: any) => {
      const sessionId = sessions[0].id;

      cy.intercept('DELETE', `**/api/session/${sessionId}`, { statusCode: 200, body: {} }).as('deleteSession');
      cy.intercept('GET', '**/api/session', { statusCode: 200, body: [] }).as('getSessionsAfterDelete');

      cy.contains('button', 'Delete').click();

      cy.wait('@deleteSession');
      cy.wait('@getSessionsAfterDelete');
      cy.url().should('include', '/sessions');
    });
  });
});
