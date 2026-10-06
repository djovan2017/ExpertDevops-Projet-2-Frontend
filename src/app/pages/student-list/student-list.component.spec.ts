import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentListComponent } from './student-list.component';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentServiceMock: { getAll: jest.Mock };
  let authService: AuthService;
  let router: Router;

  const student: Student = { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@mail.com' };

  beforeEach(async () => {
    studentServiceMock = { getAll: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentListComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should create and populate the list on successful load', () => {
    studentServiceMock.getAll.mockReturnValue(of([student]));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.students).toEqual([student]);
    expect(component.loading).toBe(false);
    expect(component.error).toBe(false);
  });

  it('should set an error state when loading fails', () => {
    studentServiceMock.getAll.mockReturnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();

    expect(component.error).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should log out and navigate to /login', () => {
    studentServiceMock.getAll.mockReturnValue(of([]));
    fixture.detectChanges();

    jest.spyOn(authService, 'logout');
    jest.spyOn(router, 'navigate');

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});