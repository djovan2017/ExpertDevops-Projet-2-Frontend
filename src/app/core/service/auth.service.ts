import { Injectable } from '@angular/core';

const TOKEN_KEY = 'authToken';

/** Décode le claim `exp` (timestamp Unix, en secondes) d'un JWT, sans vérifier sa signature. */
function readExpiryClaim(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) {
    return null;
  }

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

/**
 * Stocke le JWT courant en `sessionStorage` (perdu à la fermeture de l'onglet, pas partagé
 * entre onglets) et sert de source de vérité pour l'état de connexion.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  /** `true` si le token stocké est absent, illisible, ou si son `exp` est dépassé. */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const exp = readExpiryClaim(token);
    if (exp === null) {
      return true;
    }

    return Date.now() >= exp * 1000;
  }

  /** Vérifie la présence du token ET sa validité temporelle ; nettoie le storage si expiré. */
  isLoggedIn(): boolean {
    if (!this.getToken()) {
      return false;
    }
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}