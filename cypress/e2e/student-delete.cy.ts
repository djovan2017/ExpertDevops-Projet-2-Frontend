describe('Suppression d\'un étudiant', () => {
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
    cy.visit('/students/supprimer');
  });

  it('affiche le formulaire de suppression d\'un étudiant', () => {
    cy.contains('h5', 'Supprimer un étudiant').should('be.visible');

    cy.get('input[formControlName="id"]')
      .should('be.visible')
      .and('have.attr', 'type', 'number');

    cy.contains('button', 'Supprimer').should('be.visible');
    cy.contains('a', 'Retour au menu').should('be.visible');
    cy.contains('button', 'Déconnexion').should('be.visible');
  });

  it('affiche une erreur de validation lorsque id est vide', () => {
    cy.contains('button', 'Supprimer').click();

    cy.contains("L'id est requis").should('be.visible');

    cy.get('.alert-success').should('not.exist');
    cy.get('.alert-danger').should('not.exist');
  });

  it('supprime un étudiant et affiche le message de succès', () => {
    cy.intercept('DELETE', '/api/students/1', {
      statusCode: 204
    }).as('deleteStudent');

    cy.get('input[formControlName="id"]').type('1');

    cy.contains('button', 'Supprimer').click();

    cy.wait('@deleteStudent')
      .its('request.method')
      .should('equal', 'DELETE');

    cy.contains('Étudiant supprimé avec succès.')
      .should('be.visible');

    cy.get('.alert-danger').should('not.exist');

    // Après une suppression réussie, le composant reset le formulaire.
    cy.get('input[formControlName="id"]')
      .should('have.value', '');
  });

  it('envoie la suppression pour id saisi dans le formulaire', () => {
    cy.intercept('DELETE', '/api/students/42', (req) => {
      expect(req.method).to.equal('DELETE');

      req.reply({
        statusCode: 204
      });
    }).as('deleteStudent42');

    cy.get('input[formControlName="id"]').type('42');

    cy.contains('button', 'Supprimer').click();

    cy.wait('@deleteStudent42');

    cy.contains('Étudiant supprimé avec succès.')
      .should('be.visible');
  });

  it('affiche une erreur lorsque étudiant est introuvable', () => {
    cy.intercept('DELETE', '/api/students/999', {
      statusCode: 404,
      body: {
        message: 'Étudiant introuvable'
      }
    }).as('deleteStudentError');

    cy.get('input[formControlName="id"]').type('999');

    cy.contains('button', 'Supprimer').click();

    cy.wait('@deleteStudentError');

    cy.contains('La suppression a échoué.')
      .should('be.visible');

    cy.get('.alert-success').should('not.exist');

    // En cas d'erreur, le formulaire n'est pas réinitialisé.
    cy.get('input[formControlName="id"]')
      .should('have.value', '999');
  });

  it('affiche une erreur lorsque API retourne une erreur serveur', () => {
    cy.intercept('DELETE', '/api/students/1', {
      statusCode: 500,
      body: {
        message: 'Internal Server error'
      }
    }).as('deleteStudentServerError');

    cy.get('input[formControlName="id"]').type('1');

    cy.contains('button', 'Supprimer').click();

    cy.wait('@deleteStudentServerError');

    cy.contains('La suppression a échoué.')
      .should('be.visible');

    cy.get('input[formControlName="id"]')
      .should('have.value', '1');
  });

  it('efface une erreur précédente après une suppression réussie', () => {
    cy.intercept('DELETE', '/api/students/999', {
      statusCode: 404,
      body: {
        message: 'Étudiant introuvable'
      }
    }).as('firstDelete');

    cy.get('input[formControlName="id"]').type('999');
    cy.contains('button', 'Supprimer').click();

    cy.wait('@firstDelete');

    cy.contains('La suppression a échoué.')
      .should('be.visible');

    cy.intercept('DELETE', '/api/students/1', {
      statusCode: 204
    }).as('secondDelete');

    cy.get('input[formControlName="id"]')
      .clear()
      .type('1');

    cy.contains('button', 'Supprimer').click();

    cy.wait('@secondDelete');

    cy.contains('Étudiant supprimé avec succès.')
      .should('be.visible');

    cy.contains('La suppression a échoué.')
      .should('not.exist');
  });

  it('permet de revenir au menu étudiants', () => {
    cy.contains('a', 'Retour au menu').click();

    cy.url().should('include', '/students');

    cy.contains('Gestion des étudiants')
      .should('be.visible');
  });

  it('déconnecte utilisateur et redirige vers login', () => {
    cy.window().then((win) => {
      expect(
        win.sessionStorage.getItem('authToken')
      ).not.to.be.null;
    });

    cy.contains('button', 'Déconnexion').click();

    cy.url().should('include', '/login');

    cy.window().then((win) => {
      expect(
        win.sessionStorage.getItem('authToken')
      ).to.be.null;
    });

    cy.contains('Login Form').should('be.visible');
  });
});
