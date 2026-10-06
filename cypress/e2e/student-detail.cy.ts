describe('Détails d\'un étudiant', () => {

  /*
   * JWT fictif avec un claim exp dans le futur.
   * Il permet de franchir authGuard sans utiliser le back-end réel.
   */
  const fakeJwt =
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjQxMDI0NDQ4MDB9.';

  /**
   * Ouvre l'écran détail avec un utilisateur authentifié.
   */
  const visitDetail = () => {
    cy.visit('/students/detail', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('authToken', fakeJwt);
      }
    });
  };

  it('affiche le formulaire de recherche d\'un étudiant', () => {
    visitDetail();

    cy.contains('h5', 'Détails d\'un étudiant')
      .should('be.visible');

    cy.get('[formControlName="id"]')
      .should('be.visible')
      .and('have.attr', 'type', 'number');

    cy.contains('button', 'Rechercher')
      .should('be.visible');

    cy.contains('a', 'Retour au menu')
      .should('be.visible');

    cy.contains('button', 'Déconnexion')
      .should('be.visible');
  });

  it('affiche une erreur de validation lorsque id est vide', () => {
    visitDetail();

    cy.contains('button', 'Rechercher').click();

    cy.contains("L'id est requis")
      .should('be.visible');

    // Aucun tableau étudiant ne doit être affiché.
    cy.get('table').should('not.exist');
  });

  it('recherche un étudiant par id et affiche ses informations', () => {
    cy.intercept('GET', '/api/students/1', {
      statusCode: 200,
      body: {
        id: 1,
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com'
      }
    }).as('getStudent');

    visitDetail();

    cy.get('[formControlName="id"]').type('1');

    cy.contains('button', 'Rechercher').click();

    cy.wait('@getStudent')
      .its('request.url')
      .should('include', '/api/students/1');

    cy.get('table').should('be.visible');

    cy.get('table tbody').within(() => {
      cy.contains('th', 'Id');
      cy.contains('td', '1');

      cy.contains('th', 'Prénom');
      cy.contains('td', 'Ada');

      cy.contains('th', 'Nom');
      cy.contains('td', 'Lovelace');

      cy.contains('th', 'Email');
      cy.contains('td', 'ada@example.com');
    });

    cy.contains('Étudiant introuvable.')
      .should('not.exist');
  });

  it('affiche étudiant introuvable lorsque API retourne une erreur', () => {
    cy.intercept('GET', '/api/students/999', {
      statusCode: 404,
      body: {
        message: 'Student not found'
      }
    }).as('getStudent');

    visitDetail();

    cy.get('[formControlName="id"]').type('999');

    cy.contains('button', 'Rechercher').click();

    cy.wait('@getStudent');

    cy.contains('Étudiant introuvable.')
      .should('be.visible');

    cy.get('table').should('not.exist');
  });

  it('remplace un résultat précédent par erreur lors d\'une nouvelle recherche échouée', () => {
    cy.intercept('GET', '/api/students/1', {
      statusCode: 200,
      body: {
        id: 1,
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com'
      }
    }).as('getStudent1');

    cy.intercept('GET', '/api/students/999', {
      statusCode: 404,
      body: {
        message: 'Student not found'
      }
    }).as('getStudent999');

    visitDetail();

    // Première recherche réussie.
    cy.get('[formControlName="id"]').type('1');
    cy.contains('button', 'Rechercher').click();

    cy.wait('@getStudent1');

    cy.contains('td', 'Ada').should('be.visible');

    // Nouvelle recherche.
    cy.get('[formControlName="id"]')
      .clear()
      .type('999');

    cy.contains('button', 'Rechercher').click();

    cy.wait('@getStudent999');

    // L'ancien étudiant doit disparaître.
    cy.contains('td', 'Ada').should('not.exist');

    cy.contains('Étudiant introuvable.')
      .should('be.visible');
  });

  it('permet de revenir au menu étudiants', () => {
    visitDetail();

    cy.contains('a', 'Retour au menu')
      .should('have.attr', 'href', '/students')
      .click();

    cy.url().should('match', /\/students\/?$/);

    cy.contains('h5', 'Gestion des étudiants')
      .should('be.visible');
  });

  it('déconnecte utilisateur et redirige vers login', () => {
    visitDetail();

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken'))
        .to.equal(fakeJwt);
    });

    cy.contains('button', 'Déconnexion').click();

    cy.url().should('include', '/login');

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken'))
        .to.be.null;
    });

    cy.contains('h5', 'Login Form')
      .should('be.visible');
  });

});
