import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService} from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';

/** Recherche un étudiant par identifiant et affiche ses détails, ou une erreur si non trouvé. */
@Component({
  selector: 'app-student-detail',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css'
})
export class StudentDetailComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  searchForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  loading: boolean = false;
  error: boolean = false;
  student: Student | null = null;

  /** Initialise le formulaire de recherche (un seul champ : l'id). */
  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      id: ['', Validators.required]
    });
  }

  /** Contrôles du formulaire, exposés pour l'affichage des erreurs de validation dans le template. */
  get form() {
    return this.searchForm.controls;
  }

  /** Valide le formulaire puis recherche l'étudiant par id ; renseigne `student` ou `error`. */
  onSubmit(): void {
    this.submitted = true;
    this.student = null;
    this.error = false;

    if (this.searchForm.invalid) {
      return;
    }

    this.loading = true;
    const id = this.searchForm.get('id')?.value;

    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.student = student;
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