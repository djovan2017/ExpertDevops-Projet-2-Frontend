describe('Register - création de compte', () => {

  beforeEach(() => {
    cy.visit('/register');
  });

  it('affiche le formulaire de création de compte', () => {
    cy.contains('h5', 'Registration Form').should('be.visible');

    cy.get('[formControlName="firstName"]').should('be.visible');
    cy.get('[formControlName="lastName"]').should('be.visible');
    cy.get('[formControlName="login"]').should('be.visible');
    cy.get('[formControlName="password"]').should('be.visible');

    cy.contains('button', 'Register').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  it('affiche les erreurs lorsque le formulaire vide est soumis', () => {
    cy.contains('button', 'Register').click();

    cy.contains('First Name is required').should('be.visible');
    cy.contains('Last Name is required').should('be.visible');
    cy.contains('Login is required').should('be.visible');
    cy.contains('password is required').should('be.visible');
  });

  it('envoie les informations de création de compte à API', () => {
    cy.intercept('POST', '/api/register', {
      statusCode: 200,
      body: {}
    }).as('registerRequest');

    cy.get('[formControlName="firstName"]').type('Test');
    cy.get('[formControlName="lastName"]').type('User');
    cy.get('[formControlName="login"]').type('test-user');
    cy.get('[formControlName="password"]').type('test-password');

    cy.contains('button', 'Register').click();

    cy.wait('@registerRequest')
      .its('request.body')
      .should('deep.equal', {
        firstName: 'Test',
        lastName: 'User',
        login: 'test-user',
        password: 'test-password'
      });
  });
});
