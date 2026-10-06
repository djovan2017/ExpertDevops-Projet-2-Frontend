describe('Menu étudiants - navigation et déconnexion', () => {

  /*
   * JWT fictif avec un claim "exp" dans le futur.
   * AuthService décode exp mais ne vérifie pas la signature.
   */
  const fakeJwt =
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjQxMDI0NDQ4MDB9.';

  /**
   * Place un utilisateur authentifié dans sessionStorage
   * avant le chargement de l'application.
   */
  const visitAsAuthenticatedUser = (url = '/students') => {
    cy.visit(url, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('authToken', fakeJwt);
      }
    });
  };

  it('affiche le menu des opérations sur les étudiants pour un utilisateur authentifié', () => {
    visitAsAuthenticatedUser();

    cy.url().should('include', '/students');

    cy.contains('h5', 'Gestion des étudiants').should('be.visible');

    cy.get('.list-group-item').should('have.length', 5);

    cy.contains('a', 'Liste des étudiants').should('be.visible');
    cy.contains('a', 'Détails d\'un étudiant').should('be.visible');
    cy.contains('a', 'Créer un étudiant').should('be.visible');
    cy.contains('a', 'Modifier un étudiant').should('be.visible');
    cy.contains('a', 'Supprimer un étudiant').should('be.visible');

    cy.contains('button', 'Déconnexion').should('be.visible');
  });

  it('associe chaque action CRUD à la bonne route', () => {
    visitAsAuthenticatedUser();

    cy.contains('a', 'Liste des étudiants')
      .should('have.attr', 'href', '/students/liste');

    cy.contains('a', 'Détails d\'un étudiant')
      .should('have.attr', 'href', '/students/detail');

    cy.contains('a', 'Créer un étudiant')
      .should('have.attr', 'href', '/students/creer');

    cy.contains('a', 'Modifier un étudiant')
      .should('have.attr', 'href', '/students/modifier');

    cy.contains('a', 'Supprimer un étudiant')
      .should('have.attr', 'href', '/students/supprimer');
  });

  it('navigue vers la liste des étudiants depuis le menu', () => {
    visitAsAuthenticatedUser();

    /*
     * La page liste effectue un GET /api/students.
     * On le mocke afin que le test E2E ne dépende pas du back-end.
     */
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: []
    }).as('getStudents');

    cy.contains('a', 'Liste des étudiants').click();

    cy.url().should('include', '/students/liste');

    cy.wait('@getStudents');
  });

  it('déconnecte utilisateur, supprime le JWT et redirige vers login', () => {
    visitAsAuthenticatedUser();

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken')).to.equal(fakeJwt);
    });

    cy.contains('button', 'Déconnexion').click();

    cy.url().should('include', '/login');

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken')).to.be.null;
    });
  });

  it('redirige vers login lorsqu’un utilisateur non authentifié tente d’accéder au menu', () => {
    cy.visit('/students', {
      onBeforeLoad(win) {
        win.sessionStorage.clear();
      }
    });

    cy.url().should('include', '/login');

    cy.contains('h5', 'Login Form').should('be.visible');
  });

});
