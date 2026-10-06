describe('Création d\'un étudiant', () => {
  /**
   * AuthService considère le token valide uniquement si le JWT contient
   * un claim exp encore valide.
   */
  const validJwt = () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: 'e2e-user',
        exp: Math.floor(Date.now() / 1000) + 3600
      })
    );

    return `${header}.${payload}.fake-signature`;
  };

  const authenticate = () => {
    cy.window().then((win) => {
      win.sessionStorage.setItem('authToken', validJwt());
    });
  };

  beforeEach(() => {
    cy.visit('/login');
    authenticate();
    cy.visit('/students/creer');
  });

  it('affiche le formulaire de création d\'un étudiant', () => {
    cy.contains('h5', 'Créer un étudiant').should('be.visible');

    cy.get('input[formControlName="firstName"]').should('be.visible');
    cy.get('input[formControlName="lastName"]').should('be.visible');
    cy.get('input[formControlName="email"]').should('be.visible');

    cy.contains('button', 'Créer').should('be.visible');
    cy.contains('button', 'Annuler').should('be.visible');
    cy.contains('a', 'Retour au menu').should('be.visible');
    cy.contains('button', 'Déconnexion').should('be.visible');
  });

  it('affiche les erreurs lorsque le formulaire vide est soumis', () => {
    cy.contains('button', 'Créer').click();

    cy.contains('Le prénom est requis').should('be.visible');
    cy.contains('Le nom est requis').should('be.visible');
    cy.contains("L'email est requis").should('be.visible');

    // Aucun appel API ne doit être effectué puisque le formulaire est invalide.
    cy.get('.alert-success').should('not.exist');
  });

  it('refuse un email invalide', () => {
    cy.get('input[formControlName="firstName"]').type('Alice');
    cy.get('input[formControlName="lastName"]').type('Martin');
    cy.get('input[formControlName="email"]').type('adresse-invalide');

    cy.contains('button', 'Créer').click();

    cy.contains("L'email doit être valide").should('be.visible');
    cy.get('.alert-success').should('not.exist');
  });

  it('crée un étudiant et affiche le message de succès', () => {
    cy.intercept('POST', '/api/students', (req) => {
      expect(req.body).to.deep.equal({
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com'
      });

      req.reply({
        statusCode: 201,
        body: {
          id: 1,
          firstName: 'Alice',
          lastName: 'Martin',
          email: 'alice@example.com'
        }
      });
    }).as('createStudent');

    cy.get('input[formControlName="firstName"]').type('  Alice  ');
    cy.get('input[formControlName="lastName"]').type('  Martin  ');
    cy.get('input[formControlName="email"]').type('  alice@example.com  ');

    cy.contains('button', 'Créer').click();

    cy.wait('@createStudent');

    cy.contains('Étudiant créé avec succès.').should('be.visible');

    // Le composant réinitialise le formulaire après une création réussie.
    cy.get('input[formControlName="firstName"]').should('have.value', '');
    cy.get('input[formControlName="lastName"]').should('have.value', '');
    cy.get('input[formControlName="email"]').should('have.value', '');
  });

  it('affiche une erreur lorsque API refuse la création', () => {
    cy.intercept('POST', '/api/students', {
      statusCode: 409,
      body: {
        message: 'Un étudiant avec cet email existe déjà'
      }
    }).as('createStudentError');

    cy.get('input[formControlName="firstName"]').type('Alice');
    cy.get('input[formControlName="lastName"]').type('Martin');
    cy.get('input[formControlName="email"]').type('alice@example.com');

    cy.contains('button', 'Créer').click();

    cy.wait('@createStudentError');

    cy.contains('La création a échoué.').should('be.visible');
    cy.get('.alert-success').should('not.exist');

    // Contrairement au succès, le formulaire doit conserver les valeurs.
    cy.get('input[formControlName="firstName"]').should('have.value', 'Alice');
    cy.get('input[formControlName="lastName"]').should('have.value', 'Martin');
    cy.get('input[formControlName="email"]').should(
      'have.value',
      'alice@example.com'
    );
  });

  it('réinitialise le formulaire avec Annuler', () => {
    cy.get('input[formControlName="firstName"]').type('Alice');
    cy.get('input[formControlName="lastName"]').type('Martin');
    cy.get('input[formControlName="email"]').type('alice@example.com');

    cy.contains('button', 'Annuler').click();

    cy.get('input[formControlName="firstName"]').should('have.value', '');
    cy.get('input[formControlName="lastName"]').should('have.value', '');
    cy.get('input[formControlName="email"]').should('have.value', '');

    cy.get('.alert-danger').should('not.exist');
    cy.get('.alert-success').should('not.exist');
  });

  it('permet de revenir au menu étudiants', () => {
    cy.contains('a', 'Retour au menu').click();

    cy.url().should('include', '/students');
    cy.contains('Gestion des étudiants').should('be.visible');
  });

  it('déconnecte utilisateur et redirige vers login', () => {
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken')).not.to.be.null;
    });

    cy.contains('button', 'Déconnexion').click();

    cy.url().should('include', '/login');

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken')).to.be.null;
    });

    cy.contains('Login Form').should('be.visible');
  });
});
