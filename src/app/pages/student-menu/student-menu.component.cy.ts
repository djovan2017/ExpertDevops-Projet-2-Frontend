import { provideRouter } from '@angular/router'
import { StudentMenuComponent } from './student-menu.component'

// Deuxième exemple de Component Testing, volontairement minimal : un composant sans appel
// HTTP. `provideRouter([])` est requis car le template utilise `routerLink` et le composant
// fait `inject(Router)` (AuthService s'auto-fournit via `providedIn: 'root'`).
// Le parcours complet (navigation réelle, déconnexion) est couvert par
// `cypress/e2e/student-menu.cy.ts`.
describe('StudentMenuComponent', () => {
  beforeEach(() => {
    cy.mount(StudentMenuComponent, { providers: [provideRouter([])] })
  })

  it('rend une entrée de menu par action CRUD et le bouton de déconnexion', () => {
    cy.get('.list-group-item').should('have.length', 5)
    cy.contains('a', 'Liste des étudiants')
    cy.contains('a', 'Détails d\'un étudiant')
    cy.contains('a', 'Créer un étudiant')
    cy.contains('a', 'Modifier un étudiant')
    cy.contains('a', 'Supprimer un étudiant')
    cy.contains('button', 'Déconnexion')
  })
})