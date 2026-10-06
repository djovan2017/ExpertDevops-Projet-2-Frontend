import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentCreateComponent } from './create-student.component';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';

describe('StudentCreateComponent', () => {
  let component: StudentCreateComponent;
  let fixture: ComponentFixture<StudentCreateComponent>;
  let studentServiceMock: { create: jest.Mock };
  let authService: AuthService;
  let router: Router;

  const student: Student = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@mail.com'
  };

  beforeEach(async () => {
    studentServiceMock = { create: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentCreateComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCreateComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the form controls via the form getter', () => {
    expect(component.form).toBe(component.createForm.controls);
  });

  it('should not call create when the form is invalid', () => {
    component.onSubmit();

    expect(studentServiceMock.create).not.toHaveBeenCalled();
    expect(component.submitted).toBe(true);
  });

  it('should create the student and reset the form on success', () => {
    studentServiceMock.create.mockReturnValue(of(student));

    component.createForm.setValue(student);
    component.onSubmit();

    expect(studentServiceMock.create).toHaveBeenCalledWith(student);
    expect(component.createStatus).toBe('success');
    expect(component.isSubmitting).toBe(false);
    expect(component.submitted).toBe(false);
    expect(component.createForm.value).toEqual({
      firstName: null,
      lastName: null,
      email: null
    });
  });

  it('should set an error state when create fails', () => {
    studentServiceMock.create.mockReturnValue(
      throwError(() => new Error('fail'))
    );

    component.createForm.setValue(student);
    component.onSubmit();

    expect(component.createStatus).toBe('error');
    expect(component.isSubmitting).toBe(false);
  });

  it('should reset the form and state on onReset', () => {
    component.submitted = true;
    component.createStatus = 'error';
    component.createForm.setValue(student);

    component.onReset();

    expect(component.submitted).toBe(false);
    expect(component.createStatus).toBe('idle');
    expect(component.createForm.value).toEqual({
      firstName: null,
      lastName: null,
      email: null
    });
  });

  it('should log out and navigate to /login', () => {
    jest.spyOn(authService, 'logout');
    jest.spyOn(router, 'navigate');

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});