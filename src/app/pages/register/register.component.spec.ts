import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const userServiceMock = {
    register: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the registration form with required fields', () => {
    expect(component.registerForm).toBeDefined();

    expect(component.registerForm.contains('firstName')).toBe(true);
    expect(component.registerForm.contains('lastName')).toBe(true);
    expect(component.registerForm.contains('login')).toBe(true);
    expect(component.registerForm.contains('password')).toBe(true);

    expect(component.registerForm.valid).toBe(false);
  });

  it('should make the registration form valid when all required fields are filled', () => {
    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      login: 'test-user',
      password: 'test-password'
    });

    expect(component.registerForm.valid).toBe(true);
  });

  it('should expose form controls through the form getter', () => {
    expect(component.form).toBe(component.registerForm.controls);

    expect(component.form['firstName']).toBeDefined();
    expect(component.form['lastName']).toBeDefined();
    expect(component.form['login']).toBeDefined();
    expect(component.form['password']).toBeDefined();
  });

  it('should set submitted to true and not call register when form is invalid', () => {
    component.onSubmit();

    expect(component.submitted).toBe(true);
    expect(component.registerForm.invalid).toBe(true);
    expect(userServiceMock.register).not.toHaveBeenCalled();
  });

  it('should call UserService.register when form is valid', () => {
    userServiceMock.register.mockReturnValue(of({}));

    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      login: 'test-user',
      password: 'test-password'
    });

    const alertSpy = jest
      .spyOn(window, 'alert')
      .mockImplementation(() => {});

    component.onSubmit();

    expect(component.submitted).toBe(true);

    expect(userServiceMock.register).toHaveBeenCalledTimes(1);

    expect(userServiceMock.register).toHaveBeenCalledWith({
      firstName: 'Test',
      lastName: 'User',
      login: 'test-user',
      password: 'test-password'
    });

    alertSpy.mockRestore();
  });

  it('should display a success alert after successful registration', () => {
    userServiceMock.register.mockReturnValue(of({}));

    const alertSpy = jest
      .spyOn(window, 'alert')
      .mockImplementation(() => {});

    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      login: 'test-user',
      password: 'test-password'
    });

    component.onSubmit();

    expect(alertSpy).toHaveBeenCalledWith('SUCCESS!! :-)');

    alertSpy.mockRestore();
  });

  it('should reset the form and submitted state', () => {
    component.registerForm.setValue({
      firstName: 'Test',
      lastName: 'User',
      login: 'test-user',
      password: 'test-password'
    });

    component.submitted = true;

    component.onReset();

    expect(component.submitted).toBe(false);

    expect(component.registerForm.get('firstName')?.value).toBeNull();
    expect(component.registerForm.get('lastName')?.value).toBeNull();
    expect(component.registerForm.get('login')?.value).toBeNull();
    expect(component.registerForm.get('password')?.value).toBeNull();
  });
});