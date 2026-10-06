import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';

/** Charge et affiche la liste complète des étudiants au chargement de la page. */
@Component({
  selector: 'app-student-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  students: Student[] = [];
  loading: boolean = false;
  error: boolean = false;

  /** Récupère tous les étudiants et met à jour `loading`/`error` selon l'issue de l'appel. */
  ngOnInit(): void {
    this.loading = true;
    this.error = false;
    this.studentService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (students) => {
          this.students = students;
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
  }

  /** Déconnecte l'utilisateur et revient à `/login`. */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}