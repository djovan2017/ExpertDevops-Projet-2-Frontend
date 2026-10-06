import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';

/** Page d'accueil post-connexion : hub de navigation vers les opérations CRUD sur les étudiants. */
@Component({
  selector: 'app-student-menu',
  imports: [RouterLink],
  templateUrl: './student-menu.component.html',
  styleUrl: './student-menu.component.css'
})
export class StudentMenuComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  /** Liste affichée dans le menu ; ajouter une entrée ici suffit pour l'exposer (route à créer séparément dans `app.routes.ts`). */
  actions = [
    { label: 'Liste des étudiants', path: '/students/liste' },
    { label: 'Détails d\'un étudiant', path: '/students/detail' },
    { label: 'Créer un étudiant', path: '/students/creer' },
    { label: 'Modifier un étudiant', path: '/students/modifier' },
    { label: 'Supprimer un étudiant', path: '/students/supprimer' }
  ];

  /** Déconnecte l'utilisateur et revient à `/login`. */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}