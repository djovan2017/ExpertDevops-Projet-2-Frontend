describe('Liste des étudiants', () => {

  /*
   * JWT fictif avec une date d'expiration future.
   * Il permet de franchir authGuard sans dépendre du back-end.
   */
  const fakeJwt =
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0ZXN0LXVzZXIiLCJleHAiOjQxMDI0NDQ4MDB9.';

  /**
   * Ouvre la liste avec un utilisateur authentifié.
   *
   * L'interception doit être définie AVANT cy.visit(), car
   * StudentListComponent appelle GET /api/students dès ngOnInit().
   */
  const visitList = () => {
    cy.visit('/students/liste', {
      onBeforeLoad(win) {
        win.sessionStorage.setItem('authToken', fakeJwt);
      }
    });
  };

  it('affiche les étudiants retournés par API', () => {
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: [
        {
          id: 1,
          firstName: 'Ada',
          lastName: 'Lovelace',
          email: 'ada@example.com'
        },
        {
          id: 2,
          firstName: 'Alan',
          lastName: 'Turing',
          email: 'alan@example.com'
        }
      ]
    }).as('getStudents');

    visitList();

    cy.wait('@getStudents');

    cy.contains('h5', 'Liste des étudiants').should('be.visible');

    cy.get('table tbody tr').should('have.length', 2);

    cy.get('table tbody tr').eq(0).within(() => {
      cy.contains('td', '1');
      cy.contains('td', 'Ada');
      cy.contains('td', 'Lovelace');
      cy.contains('td', 'ada@example.com');
    });

    cy.get('table tbody tr').eq(1).within(() => {
      cy.contains('td', '2');
      cy.contains('td', 'Alan');
      cy.contains('td', 'Turing');
      cy.contains('td', 'alan@example.com');
    });
  });

  it('affiche un message lorsqu aucun étudiant existe', () => {
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: []
    }).as('getStudents');

    visitList();

    cy.wait('@getStudents');

    cy.contains('Aucun étudiant trouvé.')
      .should('be.visible');

    cy.get('table tbody tr').should('have.length', 1);
  });

  it('affiche un message erreur lorsque API échoue', () => {
    cy.intercept('GET', '/api/students', {
      statusCode: 500,
      body: {
        message: 'Internal Server Error'
      }
    }).as('getStudents');

    visitList();

    cy.wait('@getStudents');

    cy.contains('Impossible de charger la liste des étudiants.')
      .should('be.visible');

    cy.get('table').should('not.exist');
  });

  it('permet de naviguer vers écran de création', () => {
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: []
    }).as('getStudents');

    visitList();

    cy.wait('@getStudents');

    cy.contains('a', 'Créer un étudiant')
      .should('have.attr', 'href', '/students/creer')
      .click();

    cy.url().should('include', '/students/creer');
  });

  it('permet de revenir au menu étudiants', () => {
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: []
    }).as('getStudents');

    visitList();

    cy.wait('@getStudents');

    cy.contains('a', 'Retour au menu')
      .should('have.attr', 'href', '/students')
      .click();

    cy.url().should('match', /\/students\/?$/);

    cy.contains('h5', 'Gestion des étudiants')
      .should('be.visible');
  });

  it('déconnecte utilisateur et redirige vers login', () => {
    cy.intercept('GET', '/api/students', {
      statusCode: 200,
      body: []
    }).as('getStudents');

    visitList();

    cy.wait('@getStudents');

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
  });

});
