import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { getHttpStatusText } from '../../shared/utils/http-status.util';

const DELETE_SUCCESS_STATUS = 204;

/** Supprime un étudiant par identifiant ; aucune confirmation préalable n'est demandée à l'utilisateur. */
@Component({
  selector: 'app-delete-student',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './delete-student.component.html',
  styleUrl: './delete-student.component.css'
})
export class StudentDeleteComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  deleteForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  isSubmitting: boolean = false;
  deleteStatus: 'idle' | 'success' | 'error' = 'idle';
  /** Issue de la dernière tentative de suppression, utilisée pour l'affichage et le tooltip. */
  deleteResult: { status: number; message?: string; success: boolean } | null = null;

  /** Initialise le formulaire de suppression. */
  ngOnInit(): void {
    this.deleteForm = this.formBuilder.group({
      id: ['', Validators.required]
    });
  }

  /** Contrôles du formulaire, exposés pour l'affichage des erreurs de validation dans le template. */
  get form() {
    return this.deleteForm.controls;
  }

  /** Texte du tooltip : code + libellé HTTP, et message d'erreur du backend en cas d'échec. */
  get deleteTooltip(): string {
    if (!this.deleteResult) {
      return '';
    }
    const statusLine = `${this.deleteResult.status} ${getHttpStatusText(this.deleteResult.status)}`;
    return this.deleteResult.success
      ? `${statusLine} (OK)`
      : `${statusLine}\n${this.deleteResult.message}`;
  }

  /** Valide le formulaire puis supprime l'étudiant `id`. */
  onSubmit(): void {
    this.submitted = true;
    this.deleteStatus = 'idle';
    this.deleteResult = null;

    if (this.deleteForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const id = this.deleteForm.get('id')?.value;

    this.studentService.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.deleteStatus = 'success';
          this.deleteResult = { status: DELETE_SUCCESS_STATUS, success: true };
          this.isSubmitting = false;
          this.deleteForm.reset();
          this.submitted = false;
        },
        error: (err: HttpErrorResponse) => {
          this.deleteStatus = 'error';
          this.deleteResult = {
            status: err.status,
            message: err.error?.message ?? 'Erreur inconnue.',
            success: false
          };
          this.isSubmitting = false;
        }
      });
  }

  /** Déconnecte l'utilisateur et revient à `/login`. */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}