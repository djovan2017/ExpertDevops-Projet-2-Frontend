describe('Login - connexion utilisateur', () => {

  beforeEach(() => {
    // AuthService stocke le JWT dans sessionStorage.
    // Chaque test démarre donc avec une session propre.
    cy.visit('/login', {
      onBeforeLoad(win) {
        win.sessionStorage.clear();
      }
    });
  });

  it('affiche le formulaire de connexion', () => {
    cy.contains('h5', 'Login Form').should('be.visible');

    cy.get('[formControlName="login"]').should('be.visible');
    cy.get('[formControlName="password"]').should('be.visible');

    cy.contains('button', 'Login').should('be.visible');
    cy.contains('button', 'Cancel').should('be.visible');
  });

  it('affiche les erreurs lorsque le formulaire vide est soumis', () => {
    cy.contains('button', 'Login').click();

    cy.contains('Login is required').should('be.visible');
    cy.contains('password is required').should('be.visible');

    // Le formulaire étant invalide, l'utilisateur reste sur /login.
    cy.url().should('include', '/login');
  });

  it('envoie les identifiants à API, stocke le JWT et redirige vers /students en cas de succès', () => {
    /*
     * JWT fictif utilisé uniquement pour le test E2E.
     *
     * AuthService ne vérifie pas la signature du token mais décode son
     * payload et contrôle le claim "exp".
     *
     * Ce token contient donc une date d'expiration suffisamment éloignée
     * dans le futur pour être accepté par authGuard.
     */
    const fakeJwt =
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjQxMDI0NDQ4MDB9.';

    cy.intercept('POST', '/api/login', {
      statusCode: 200,
      body: {
        token: fakeJwt
      }
    }).as('loginRequest');

    cy.get('[formControlName="login"]').type('test-user');
    cy.get('[formControlName="password"]').type('test-password');

    cy.contains('button', 'Login').click();

    // Vérifie que le front-end envoie les bonnes données à l'API.
    cy.wait('@loginRequest')
      .its('request.body')
      .should('deep.equal', {
        login: 'test-user',
        password: 'test-password'
      });

    // Vérifie que AuthService a enregistré le JWT.
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken')).to.equal(fakeJwt);
    });

    // Le JWT étant valide temporellement, authGuard autorise /students.
    cy.url().should('include', '/students');
  });

  it('affiche une erreur lorsque les identifiants sont invalides', () => {
    cy.intercept('POST', '/api/login', {
      statusCode: 401,
      body: {
        message: 'Invalid credentials'
      }
    }).as('loginRequest');

    cy.get('[formControlName="login"]').type('invalid-user');
    cy.get('[formControlName="password"]').type('invalid-password');

    cy.contains('button', 'Login').click();

    cy.wait('@loginRequest');

    cy.contains('Login or password is invalid')
      .should('be.visible');

    // Une authentification refusée ne doit pas quitter l'écran Login.
    cy.url().should('include', '/login');

    // Aucun JWT ne doit avoir été enregistré.
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken')).to.be.null;
    });
  });

  it('réinitialise le formulaire avec Cancel', () => {
    cy.get('[formControlName="login"]').type('test-user');
    cy.get('[formControlName="password"]').type('test-password');

    cy.contains('button', 'Cancel').click();

    cy.get('[formControlName="login"]').should('have.value', '');
    cy.get('[formControlName="password"]').should('have.value', '');
  });

});