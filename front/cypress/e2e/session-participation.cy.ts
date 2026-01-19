/// <reference types="cypress" />

type User = { id: number };
type Teacher = { id: number; firstName: string; lastName: string };
type Session = { id: number; users: number[] } & Record<string, unknown>;

describe('Session participation (non-admin)', () => {
  beforeEach(() => {
    cy.fixture('user-user.json').as('normalUser');
    cy.fixture('teacher.json').as('teachers');
    cy.fixture('sessions.json').as('sessions');
  });

  const loginAs = () => {
    cy.get('@normalUser').then((user: unknown) => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: user,
      }).as('login');
    });

    cy.get('@sessions').then((sessions: unknown) => {
      cy.intercept('GET', '**/api/session', {
        statusCode: 200,
        body: sessions,
      }).as('getSessions');
    });

    cy.visit('/login');
    cy.get('input[formcontrolname="email"]').type('user@yoga.com');
    cy.get('input[formcontrolname="password"]').type('password');
    cy.contains('button', 'Submit').click();

    cy.wait('@login');
    cy.wait('@getSessions');
    cy.url().should('include', '/sessions');
  };

  it('should participate, then unparticipate', () => {
    loginAs();

    cy.get('@normalUser').then((user: unknown) => {
      const u = user as User;

      cy.get('@sessions').then((sessions: unknown) => {
        const list = sessions as Session[];
        const base = list[0];
        const sessionId = base.id;

        const usersNotParticipating = [1, 3, 4].filter((id) => id !== u.id);
        const sessionNotParticipating: Session = { ...base, users: usersNotParticipating };

        cy.intercept('GET', `**/api/session/${sessionId}`, {
          statusCode: 200,
          body: sessionNotParticipating,
        }).as('getSessionNotParticipating');

        cy.get('@teachers').then((teachers: unknown) => {
          const t = (teachers as Teacher[])[0];

          cy.intercept('GET', `**/api/teacher/${t.id}`, {
            statusCode: 200,
            body: t,
          }).as('getTeacher');
        });

        cy.contains('button', 'Detail').first().click();
        cy.url().should('include', `/sessions/detail/${sessionId}`);

        cy.wait('@getSessionNotParticipating');
        cy.wait('@getTeacher');

        cy.contains('button', 'Participate').should('exist');
        cy.contains('button', 'Do not participate').should('not.exist');

        cy.intercept('POST', `**/api/session/${sessionId}/participate/${u.id}`, {
          statusCode: 200,
          body: {},
        }).as('participate');

        const usersParticipating = Array.from(new Set([...usersNotParticipating, u.id]));
        const sessionParticipating: Session = { ...base, users: usersParticipating };

        cy.intercept('GET', `**/api/session/${sessionId}`, {
          statusCode: 200,
          body: sessionParticipating,
        }).as('getSessionParticipating');

        cy.contains('button', 'Participate').click();

        cy.wait('@participate');
        cy.wait('@getSessionParticipating');

        cy.contains('button', 'Do not participate').should('exist');
        cy.contains('button', 'Participate').should('not.exist');

        cy.intercept('DELETE', `**/api/session/${sessionId}/participate/${u.id}`, {
          statusCode: 200,
          body: {},
        }).as('unparticipate');

        const usersAfter = usersNotParticipating;
        const sessionAfter: Session = { ...base, users: usersAfter };

        cy.intercept('GET', `**/api/session/${sessionId}`, {
          statusCode: 200,
          body: sessionAfter,
        }).as('getSessionAfterUnparticipate');

        cy.contains('button', 'Do not participate').click();

        cy.wait('@unparticipate');
        cy.wait('@getSessionAfterUnparticipate');

        cy.contains('button', 'Participate').should('exist');
        cy.contains('button', 'Do not participate').should('not.exist');
      });
    });
  });
});
