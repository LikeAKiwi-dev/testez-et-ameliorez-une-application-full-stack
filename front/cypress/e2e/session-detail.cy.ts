describe('Session detail page (via UI navigation)', () => {
  const sessionId = 12;

  const teacher = {
    id: 77,
    firstName: 'Ada',
    lastName: 'Lovelace',
  };

  const makeSession = (users: number[]) => ({
    id: sessionId,
    name: 'Yoga',
    description: 'Relax',
    date: new Date().toISOString(),
    teacher_id: teacher.id,
    users,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const loginAs = (admin: boolean, userId: number) => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { id: userId, admin },
    }).as('login');

    // Après login, la page /sessions appelle GET /api/session
    cy.intercept('GET', '**/api/session', {
      statusCode: 200,
      body: [makeSession([])], // on met une session pour pouvoir cliquer "Detail"
    }).as('getSessions');

    cy.visit('/login');
    cy.get('input[formcontrolname="email"]').type('test@test.com');
    cy.get('input[formcontrolname="password"]').type('password');
    cy.contains('button', 'Submit').click();

    cy.wait('@login');
    cy.wait('@getSessions');
    cy.url().should('include', '/sessions');
  };

  const interceptDetail = (users: number[]) => {
    cy.intercept('GET', '**/api/session/*', (req) => {
      if (req.url.includes(`/api/session/${sessionId}`) || req.url.includes(`api/session/${sessionId}`)) {
        req.reply({ statusCode: 200, body: makeSession(users) });
      }
    }).as('getSession');

    cy.intercept('GET', '**/api/teacher/*', (req) => {
      if (req.url.includes(`/api/teacher/${teacher.id}`) || req.url.includes(`api/teacher/${teacher.id}`)) {
        req.reply({ statusCode: 200, body: teacher });
      }
    }).as('getTeacher');
  };

  const goToDetailByClick = () => {
    // clic sur le premier bouton "Detail" de la liste
    cy.contains('button', 'Detail').first().click();
    cy.url().should('include', `/sessions/detail/`);
  };

  it('admin: should show Delete button', () => {
    loginAs(true, 1);

    interceptDetail([2, 3]);
    goToDetailByClick();

    cy.wait('@getSession');
    cy.wait('@getTeacher');

    cy.contains('h1', 'Yoga').should('exist');
    cy.contains('Ada LOVELACE').should('exist');
    cy.contains('button', 'Delete').should('exist');
  });

  it('non-admin: should show Participate when NOT participating', () => {
    loginAs(false, 5);

    interceptDetail([1, 2]); // 5 n'est pas dedans
    goToDetailByClick();

    cy.wait('@getSession');
    cy.wait('@getTeacher');

    cy.contains('button', 'Participate').should('exist');
    cy.contains('button', 'Do not participate').should('not.exist');
    cy.contains('button', 'Delete').should('not.exist');
  });

  it('non-admin: should show Do not participate when participating', () => {
    loginAs(false, 5);

    interceptDetail([5, 9]); // 5 est dedans
    goToDetailByClick();

    cy.wait('@getSession');
    cy.wait('@getTeacher');

    cy.contains('button', 'Do not participate').should('exist');
    cy.contains('button', 'Participate').should('not.exist');
    cy.contains('button', 'Delete').should('not.exist');
  });

  it('admin: should delete and go back to sessions list', () => {
    loginAs(true, 1);

    interceptDetail([2, 3]);
    goToDetailByClick();

    cy.wait('@getSession');
    cy.wait('@getTeacher');

    cy.intercept('DELETE', '**/api/session/*', (req) => {
      if (req.url.includes(`/api/session/${sessionId}`) || req.url.includes(`api/session/${sessionId}`)) {
        req.reply({ statusCode: 200, body: {} });
      }
    }).as('deleteSession');

    // après delete -> navigate to /sessions et recharge la liste
    cy.intercept('GET', '**/api/session', {
      statusCode: 200,
      body: [],
    }).as('getSessionsAfterDelete');

    cy.contains('button', 'Delete').click();

    cy.wait('@deleteSession');
    cy.wait('@getSessionsAfterDelete');

    cy.url().should('include', '/sessions');
  });
});
