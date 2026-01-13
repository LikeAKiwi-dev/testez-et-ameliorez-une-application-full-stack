describe('Sessions list page', () => {
  const mockSessions = [
    {
      id: 1,
      name: 'Yoga',
      description: 'Relax',
      date: new Date().toISOString(),
      teacher_id: 1,
      users: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const loginAs = (admin: boolean) => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { id: 1, admin },
    }).as('login');

    cy.visit('/login');

    cy.get('input[formcontrolname="email"]').type('test@test.com');
    cy.get('input[formcontrolname="password"]').type('password');

    cy.contains('button', 'Submit').click();
    cy.wait('@login');

    cy.url().should('include', '/sessions');
  };

  beforeEach(() => {
    cy.intercept('GET', '**/api/session', {
      statusCode: 200,
      body: mockSessions,
    }).as('getSessions');
  });

  it('should show Create and Edit buttons when user is admin', () => {
    loginAs(true);

    cy.wait('@getSessions');

    cy.contains('Rentals available').should('exist');
    cy.contains('Yoga').should('exist');

    cy.contains('button', 'Create').should('exist');
    cy.contains('button', 'Edit').should('exist');
    cy.contains('button', 'Detail').should('exist');
  });

  it('should hide Create and Edit buttons when user is not admin, but still show Detail', () => {
    loginAs(false);

    cy.wait('@getSessions');

    cy.contains('Rentals available').should('exist');
    cy.contains('Yoga').should('exist');

    cy.contains('button', 'Create').should('not.exist');
    cy.contains('button', 'Edit').should('not.exist');
    cy.contains('button', 'Detail').should('exist');
  });
});
