import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { Register } from '../models/Register';
import { Login } from '../models/Login';
import { LoginResponse } from '../models/LoginResponse';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('register should POST /api/register with the payload', () => {
    const registerUser: Register = { firstName: 'Jean', lastName: 'Dupont', login: 'jdupont', password: 'secret' };

    service.register(registerUser).subscribe();

    const req = httpMock.expectOne('/api/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(registerUser);
    req.flush({});
  });

  it('login should POST /api/login with the payload and return a token', () => {
    const loginUser: Login = { login: 'jdupont', password: 'secret' };
    const response: LoginResponse = { status: 'ok', message: 'success', token: 'abc123' };

    service.login(loginUser).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne('/api/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(loginUser);
    req.flush(response);
  });
});