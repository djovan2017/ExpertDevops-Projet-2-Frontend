import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';
import { getHttpStatusText } from '../../shared/utils/http-status.util';

const CREATE_SUCCESS_STATUS = 201;

/**
 * Formulaire de création d'un étudiant. Le résultat de l'appel (succès ou erreur HTTP) est
 * conservé dans `createResult`/`createStatus` pour piloter l'affichage et le tooltip du bouton,
 * plutôt que d'être seulement loggé.
 */
@Component({
  selector: 'app-create-student',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './create-student.component.html',
  styleUrl: './create-student.component.css'
})
export class StudentCreateComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  createForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  isSubmitting: boolean = false;
  createStatus: 'idle' | 'success' | 'error' = 'idle';
  /** Issue de la dernière tentative de création, utilisée pour l'affichage et le tooltip. */
  createResult: { status: number; message?: string; success: boolean } | null = null;

  /** Initialise le formulaire de création. */
  ngOnInit(): void {
    this.createForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /** Contrôles du formulaire, exposés pour l'affichage des erreurs de validation dans le template. */
  get form() {
    return this.createForm.controls;
  }

  /** Texte du tooltip : code + libellé HTTP, et message d'erreur du backend en cas d'échec. */
  get createTooltip(): string {
    if (!this.createResult) {
      return '';
    }
    const statusLine = `${this.createResult.status} ${getHttpStatusText(this.createResult.status)}`;
    return this.createResult.success
      ? statusLine
      : `${statusLine}\n${this.createResult.message}`;
  }

  /** Valide le formulaire puis crée l'étudiant ; réinitialise le formulaire en cas de succès. */
  onSubmit(): void {
    this.submitted = true;
    this.createStatus = 'idle';
    this.createResult = null;

    if (this.createForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const student: Student = {
      firstName: this.createForm.get('firstName')?.value?.trim(),
      lastName: this.createForm.get('lastName')?.value?.trim(),
      email: this.createForm.get('email')?.value?.trim()
    };

    this.studentService.create(student)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.createStatus = 'success';
          this.createResult = { status: CREATE_SUCCESS_STATUS, success: true };
          this.isSubmitting = false;
          this.createForm.reset();
          this.submitted = false;
        },
        error: (err: HttpErrorResponse) => {
          this.createStatus = 'error';
          this.createResult = {
            status: err.status,
            message: err.error?.message ?? 'Erreur inconnue.',
            success: false
          };
          this.isSubmitting = false;
        }
      });
  }

  /** Réinitialise le formulaire et l'état d'affichage du résultat. */
  onReset(): void {
    this.submitted = false;
    this.createStatus = 'idle';
    this.createResult = null;
    this.createForm.reset();
  }

  /** Déconnecte l'utilisateur et revient à `/login`. */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}