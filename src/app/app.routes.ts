import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { StudentMenuComponent } from './pages/student-menu/student-menu.component';
import { StudentListComponent } from './pages/student-list/student-list.component';
import { StudentDetailComponent } from './pages/student-detail/student-detail.component';
import { StudentCreateComponent } from './pages/create-student/create-student.component';
import { UpdateStudentComponent } from './pages/update-student/update-student.component';
import { StudentDeleteComponent } from './pages/delete-student/delete-student.component';
import { authGuard } from './core/guard/auth.guard';

/**
 * Routes de l'application. Le sous-arbre `/students/*` est protégé par `authGuard` posé sur la
 * route parente : toute tentative d'y accéder sans JWT valide redirige vers `/login`.
 *
 * La route wildcard (`**`) capture toute URL qui ne correspond à aucune route déclarée
 * ci-dessus (ex. `/students/xxx`, `/students/detail/6` — ce dernier n'a pas de segment `:id`).
 * Sans elle, Angular abandonne silencieusement la navigation faute de correspondance : le guard
 * n'est jamais évalué (il n'est atteint que si toute l'URL matche l'arbre `students/*`), et la
 * vue précédente peut rester affichée. La wildcard doit rester le DERNIER élément du tableau :
 * les routes sont testées dans l'ordre et `**` matche tout.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'students',
    canActivate: [authGuard],
    children: [
      { path: '', component: StudentMenuComponent },
      { path: 'liste', component: StudentListComponent },
      { path: 'detail', component: StudentDetailComponent },
      { path: 'creer', component: StudentCreateComponent },
      { path: 'modifier', component: UpdateStudentComponent },
      { path: 'supprimer', component: StudentDeleteComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];