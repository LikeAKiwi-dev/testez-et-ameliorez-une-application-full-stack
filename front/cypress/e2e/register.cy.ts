describe('Register page', () => {
  beforeEach(() => {
    cy.visit('/register');

    cy.intercept('POST', '**/auth/register', {
      statusCode: 200,
      body: {}
    }).as('register');
  });

  it('should register a new user and redirect to login', () => {
    cy.get('input[formcontrolname="firstName"]').type('John');
    cy.get('input[formcontrolname="lastName"]').type('Doe');
    cy.get('input[formcontrolname="email"]').type('john@doe.com');
    cy.get('input[formcontrolname="password"]').type('password');

    cy.contains('button', 'Submit').click();

    cy.wait('@register');
    cy.url().should('include', '/login');
  });
});
