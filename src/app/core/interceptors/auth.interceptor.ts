import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';

const LOGIN_URL = '/api/login';

/**
 * Ajoute `Authorization: Bearer <token>` à chaque requête sortante si l'utilisateur est connecté.
 * Sur une réponse 401 (hors `/api/login`, où 401 signifie juste "identifiants invalides"),
 * déconnecte l'utilisateur et le redirige vers `/login` : le JWT est expiré ou invalide.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes(LOGIN_URL)) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};