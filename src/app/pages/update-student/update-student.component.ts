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

const UPDATE_SUCCESS_STATUS = 200;

/**
 * Modification d'un étudiant en deux étapes distinctes, chacune avec son propre formulaire :
 * `loadForm` (saisie de l'id) charge l'étudiant via `onLoad`, puis `updateForm` (pré-rempli)
 * envoie les changements via `onUpdate`. Toujours possible de recharger un autre id sans
 * recharger la page.
 */
@Component({
  selector: 'app-update-student',
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './update-student.component.html',
  styleUrl: './update-student.component.css'
})
export class UpdateStudentComponent implements OnInit {
  private studentService = inject(StudentService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  loadForm: FormGroup = new FormGroup({});
  updateForm: FormGroup = new FormGroup({});
  loadSubmitted: boolean = false;
  updateSubmitted: boolean = false;
  loading: boolean = false;
  loadError: boolean = false;
  isSubmitting: boolean = false;
  updateStatus: 'idle' | 'success' | 'error' = 'idle';
  /** Issue de la dernière tentative de modification, utilisée pour l'affichage et le tooltip. */
  updateResult: { status: number; message?: string; success: boolean } | null = null;
  studentLoaded: boolean = false;

  /** Initialise les deux formulaires (recherche par id, puis édition des champs). */
  ngOnInit(): void {
    this.loadForm = this.formBuilder.group({
      id: ['', Validators.required]
    });
    this.updateForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /** Contrôles de `loadForm`, exposés pour l'affichage des erreurs de validation dans le template. */
  get loadFormControls() {
    return this.loadForm.controls;
  }

  /** Contrôles de `updateForm`, exposés pour l'affichage des erreurs de validation dans le template. */
  get updateFormControls() {
    return this.updateForm.controls;
  }

  /** Récupère l'étudiant `loadForm.id` et pré-remplit `updateForm` avec ses valeurs. */
  onLoad(): void {
    this.loadSubmitted = true;
    this.loadError = false;
    this.studentLoaded = false;
    this.updateStatus = 'idle';

    if (this.loadForm.invalid) {
      return;
    }

    this.loading = true;
    const id = this.loadForm.get('id')?.value;

    this.studentService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.updateForm.patchValue(student);
          this.studentLoaded = true;
          this.loading = false;
        },
        error: () => {
          this.loadError = true;
          this.loading = false;
        }
      });
  }

  /** Texte du tooltip : code + libellé HTTP, et message d'erreur du backend en cas d'échec. */
  get updateTooltip(): string {
    if (!this.updateResult) {
      return '';
    }
    const statusLine = `${this.updateResult.status} ${getHttpStatusText(this.updateResult.status)}`;
    return this.updateResult.success
      ? statusLine
      : `${statusLine}\n${this.updateResult.message}`;
  }

  /** Envoie `updateForm` pour l'id chargé par `onLoad` (id lu depuis `loadForm`, pas depuis `updateForm`). */
  onUpdate(): void {
    this.updateSubmitted = true;
    this.updateStatus = 'idle';
    this.updateResult = null;

    if (this.updateForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const id = this.loadForm.get('id')?.value;
    const student: Student = {
      firstName: this.updateForm.get('firstName')?.value?.trim(),
      lastName: this.updateForm.get('lastName')?.value?.trim(),
      email: this.updateForm.get('email')?.value?.trim()
    };

    this.studentService.update(id, student)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updateStatus = 'success';
          this.updateResult = { status: UPDATE_SUCCESS_STATUS, success: true };
          this.isSubmitting = false;
        },
        error: (err: HttpErrorResponse) => {
          this.updateStatus = 'error';
          this.updateResult = {
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