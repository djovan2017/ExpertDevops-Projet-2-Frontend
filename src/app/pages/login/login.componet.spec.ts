import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';
import { AuthService } from '../../core/service/auth.service';
import { LoginResponse } from '../../core/models/LoginResponse';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: UserService;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        // Stub neutre : login() renvoie un observable vide ; chaque test le surcharge
        // avec jest.spyOn(...).mockReturnValue(...) pour contrôler succès/erreur.
        { provide: UserService, useValue: { login: () => of() } },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the form controls via the form getter', () => {
    expect(component.form).toBe(component.loginForm.controls);
  });

  it('should not call userService.login when the form is invalid', () => {
    jest.spyOn(userService, 'login');

    component.onSubmit();

    expect(userService.login).not.toHaveBeenCalled();
    expect(component.submitted).toBe(true);
    expect(component.isSubmitting).toBe(false);
  });

  it('should store the token and navigate to /students on successful login', () => {
    const response: LoginResponse = { status: 'ok', message: 'success', token: 'abc123' };
    jest.spyOn(userService, 'login').mockReturnValue(of(response));
    jest.spyOn(authService, 'setToken');
    jest.spyOn(router, 'navigate');

    component.loginForm.setValue({ login: 'jdupont', password: 'secret' });
    component.onSubmit();

    expect(authService.setToken).toHaveBeenCalledWith('abc123');
    expect(component.loginStatus).toBe('success');
    expect(component.invalidCredentials).toBe(false);
    expect(component.isSubmitting).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/students']);
  });

  it('should set an error state when login fails', () => {
    jest.spyOn(userService, 'login').mockReturnValue(throwError(() => new Error('invalid credentials')));

    component.loginForm.setValue({ login: 'jdupont', password: 'wrong' });
    component.onSubmit();

    expect(component.invalidCredentials).toBe(true);
    expect(component.loginStatus).toBe('error');
    expect(component.isSubmitting).toBe(false);
  });

  it('should reset the form and state on onReset', () => {
    component.submitted = true;
    component.invalidCredentials = true;
    component.loginStatus = 'error';
    component.loginForm.setValue({ login: 'jdupont', password: 'secret' });

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.invalidCredentials).toBe(false);
    expect(component.loginStatus).toBe('idle');
    expect(component.loginForm.value).toEqual({ login: null, password: null });
  });
});