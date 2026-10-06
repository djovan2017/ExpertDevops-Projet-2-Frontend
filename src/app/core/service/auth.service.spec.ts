import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

/** Construit un faux JWT (signature bidon) avec un claim `exp` donné, pour les tests. */
function fakeJwt(exp: number): string {
  const base64url = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${base64url({ alg: 'HS256' })}.${base64url({ exp })}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have no token and report as logged out initially', () => {
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should store the token in sessionStorage on setToken', () => {
    const token = fakeJwt(Math.floor(Date.now() / 1000) + 3600);
    service.setToken(token);

    expect(sessionStorage.getItem('authToken')).toBe(token);
    expect(service.getToken()).toBe(token);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should remove the token from sessionStorage on logout', () => {
    service.setToken(fakeJwt(Math.floor(Date.now() / 1000) + 3600));

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should report isTokenExpired false for a token with a future exp', () => {
    service.setToken(fakeJwt(Math.floor(Date.now() / 1000) + 3600));

    expect(service.isTokenExpired()).toBe(false);
  });

  it('should report isTokenExpired true and clear the token for a past exp', () => {
    service.setToken(fakeJwt(Math.floor(Date.now() / 1000) - 10));

    expect(service.isTokenExpired()).toBe(true);
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('should treat a malformed (non-JWT) token as expired', () => {
    service.setToken('not-a-jwt');

    expect(service.isTokenExpired()).toBe(true);
    expect(service.isLoggedIn()).toBe(false);
  });
});