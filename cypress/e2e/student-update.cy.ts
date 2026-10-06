describe('Modification d\'un étudiant', () => {
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
    cy.visit('/students/modifier');
  });

  it('affiche le formulaire de chargement d\'un étudiant', () => {
    cy.contains('h5', 'Modifier un étudiant').should('be.visible');

    cy.get('input[formControlName="id"]').should('be.visible');
    cy.contains('button', "Charger l'étudiant").should('be.visible');

    cy.contains('a', 'Retour au menu').should('be.visible');
    cy.contains('button', 'Déconnexion').should('be.visible');

    // Le formulaire de modification ne doit pas encore être affiché.
    cy.contains('button', 'Enregistrer').should('not.exist');
  });

  it('affiche une erreur de validation lorsque id est vide', () => {
    cy.contains('button', "Charger l'étudiant").click();

    cy.contains("L'id est requis").should('be.visible');

    // Aucun formulaire de modification tant qu'un étudiant
    // n'a pas été chargé.
    cy.contains('button', 'Enregistrer').should('not.exist');
  });

  it('charge un étudiant et pré-remplit le formulaire de modification', () => {
    cy.intercept('GET', '/api/students/1', {
      statusCode: 200,
      body: {
        id: 1,
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com'
      }
    }).as('getStudent');

    cy.get('input[formControlName="id"]').type('1');
    cy.contains('button', "Charger l'étudiant").click();

    cy.wait('@getStudent');

    cy.get('input[formControlName="firstName"]')
      .should('be.visible')
      .and('have.value', 'Alice');

    cy.get('input[formControlName="lastName"]')
      .should('have.value', 'Martin');

    cy.get('input[formControlName="email"]')
      .should('have.value', 'alice@example.com');

    cy.contains('button', 'Enregistrer').should('be.visible');
  });

  it('affiche étudiant introuvable lorsque API échoue au chargement', () => {
    cy.intercept('GET', '/api/students/999', {
      statusCode: 404,
      body: {
        message: 'Étudiant introuvable'
      }
    }).as('getStudentError');

    cy.get('input[formControlName="id"]').type('999');
    cy.contains('button', "Charger l'étudiant").click();

    cy.wait('@getStudentError');

    cy.contains('Étudiant introuvable.').should('be.visible');

    cy.contains('button', 'Enregistrer').should('not.exist');
  });

  it('valide les champs du formulaire de modification', () => {
    cy.intercept('GET', '/api/students/1', {
      statusCode: 200,
      body: {
        id: 1,
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com'
      }
    }).as('getStudent');

    cy.get('input[formControlName="id"]').type('1');
    cy.contains('button', "Charger l'étudiant").click();

    cy.wait('@getStudent');

    cy.get('input[formControlName="firstName"]').clear();
    cy.get('input[formControlName="lastName"]').clear();
    cy.get('input[formControlName="email"]').clear();

    cy.contains('button', 'Enregistrer').click();

    cy.contains('Le prénom est requis').should('be.visible');
    cy.contains('Le nom est requis').should('be.visible');
    cy.contains("L'email est requis").should('be.visible');
  });

  it('refuse un email invalide lors de la modification', () => {
    cy.intercept('GET', '/api/students/1', {
      statusCode: 200,
      body: {
        id: 1,
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com'
      }
    }).as('getStudent');

    cy.get('input[formControlName="id"]').type('1');
    cy.contains('button', "Charger l'étudiant").click();

    cy.wait('@getStudent');

    cy.get('input[formControlName="email"]')
      .clear()
      .type('adresse-invalide');

    cy.contains('button', 'Enregistrer').click();

    cy.contains("L'email doit être valide").should('be.visible');
  });

  it('modifie un étudiant et affiche le message de succès', () => {
    cy.intercept('GET', '/api/students/1', {
      statusCode: 200,
      body: {
        id: 1,
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com'
      }
    }).as('getStudent');

    cy.intercept('PUT', '/api/students/1', (req) => {
      expect(req.body).to.deep.equal({
        firstName: 'Alicia',
        lastName: 'Durand',
        email: 'alicia@example.com'
      });

      req.reply({
        statusCode: 200,
        body: {
          id: 1,
          firstName: 'Alicia',
          lastName: 'Durand',
          email: 'alicia@example.com'
        }
      });
    }).as('updateStudent');

    cy.get('input[formControlName="id"]').type('1');
    cy.contains('button', "Charger l'étudiant").click();

    cy.wait('@getStudent');

    cy.get('input[formControlName="firstName"]')
      .clear()
      .type('  Alicia  ');

    cy.get('input[formControlName="lastName"]')
      .clear()
      .type('  Durand  ');

    cy.get('input[formControlName="email"]')
      .clear()
      .type('  alicia@example.com  ');

    cy.contains('button', 'Enregistrer').click();

    cy.wait('@updateStudent');

    cy.contains('Étudiant modifié avec succès.')
      .should('be.visible');

    cy.get('.alert-danger').should('not.exist');
  });

  it('affiche une erreur lorsque API refuse la modification', () => {
    cy.intercept('GET', '/api/students/1', {
      statusCode: 200,
      body: {
        id: 1,
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com'
      }
    }).as('getStudent');

    cy.intercept('PUT', '/api/students/1', {
      statusCode: 409,
      body: {
        message: 'Un étudiant avec cet email existe déjà'
      }
    }).as('updateStudentError');

    cy.get('input[formControlName="id"]').type('1');
    cy.contains('button', "Charger l'étudiant").click();

    cy.wait('@getStudent');

    cy.get('input[formControlName="email"]')
      .clear()
      .type('duplicate@example.com');

    cy.contains('button', 'Enregistrer').click();

    cy.wait('@updateStudentError');

    cy.contains('La modification a échoué.')
      .should('be.visible');

    cy.get('.alert-success').should('not.exist');

    // Les valeurs saisies doivent rester présentes après l'échec.
    cy.get('input[formControlName="email"]')
      .should('have.value', 'duplicate@example.com');
  });

  it('permet de charger un autre étudiant après un premier chargement', () => {
    cy.intercept('GET', '/api/students/1', {
      statusCode: 200,
      body: {
        id: 1,
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com'
      }
    }).as('getFirstStudent');

    cy.intercept('GET', '/api/students/2', {
      statusCode: 200,
      body: {
        id: 2,
        firstName: 'Bob',
        lastName: 'Dupont',
        email: 'bob@example.com'
      }
    }).as('getSecondStudent');

    cy.get('input[formControlName="id"]').type('1');
    cy.contains('button', "Charger l'étudiant").click();

    cy.wait('@getFirstStudent');

    cy.get('input[formControlName="firstName"]')
      .should('have.value', 'Alice');

    // On recharge un autre étudiant sans changer de page.
    cy.get('input[formControlName="id"]')
      .clear()
      .type('2');

    cy.contains('button', "Charger l'étudiant").click();

    cy.wait('@getSecondStudent');

    cy.get('input[formControlName="firstName"]')
      .should('have.value', 'Bob');

    cy.get('input[formControlName="lastName"]')
      .should('have.value', 'Dupont');

    cy.get('input[formControlName="email"]')
      .should('have.value', 'bob@example.com');
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
