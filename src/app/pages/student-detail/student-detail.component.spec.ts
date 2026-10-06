import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentDetailComponent } from './student-detail.component';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let studentServiceMock: { getById: jest.Mock };
  let authService: AuthService;
  let router: Router;

  const student: Student = { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@mail.com' };

  beforeEach(async () => {
    studentServiceMock = { getById: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the form controls via the form getter', () => {
    expect(component.form).toBe(component.searchForm.controls);
  });

  it('should not call getById when the search form is invalid', () => {
    component.onSubmit();

    expect(studentServiceMock.getById).not.toHaveBeenCalled();
    expect(component.submitted).toBe(true);
  });

  it('should load the student when the search succeeds', () => {
    studentServiceMock.getById.mockReturnValue(of(student));

    component.searchForm.setValue({ id: 1 });
    component.onSubmit();

    expect(studentServiceMock.getById).toHaveBeenCalledWith(1);
    expect(component.student).toEqual(student);
    expect(component.loading).toBe(false);
    expect(component.error).toBe(false);
  });

  it('should set an error state when the search fails', () => {
    studentServiceMock.getById.mockReturnValue(throwError(() => new Error('not found')));

    component.searchForm.setValue({ id: 999 });
    component.onSubmit();

    expect(component.error).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should log out and navigate to /login', () => {
    jest.spyOn(authService, 'logout');
    jest.spyOn(router, 'navigate');

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});