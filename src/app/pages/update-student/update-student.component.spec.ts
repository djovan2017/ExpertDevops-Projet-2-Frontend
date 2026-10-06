import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { UpdateStudentComponent } from './update-student.component';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';
import { Student } from '../../core/models/Student';

describe('UpdateStudentComponent', () => {
  let component: UpdateStudentComponent;
  let fixture: ComponentFixture<UpdateStudentComponent>;
  let studentServiceMock: { getById: jest.Mock; update: jest.Mock };
  let authService: AuthService;
  let router: Router;

  const student: Student = { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@mail.com' };

  beforeEach(async () => {
    studentServiceMock = { getById: jest.fn(), update: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [UpdateStudentComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: studentServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateStudentComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the form controls via the loadFormControls/updateFormControls getters', () => {
    expect(component.loadFormControls).toBe(component.loadForm.controls);
    expect(component.updateFormControls).toBe(component.updateForm.controls);
  });

  it('should not call getById when the load form is invalid', () => {
    component.onLoad();

    expect(studentServiceMock.getById).not.toHaveBeenCalled();
    expect(component.loadSubmitted).toBe(true);
  });

  it('should load and patch the update form when the load succeeds', () => {
    studentServiceMock.getById.mockReturnValue(of(student));

    component.loadForm.setValue({ id: 1 });
    component.onLoad();

    expect(studentServiceMock.getById).toHaveBeenCalledWith(1);
    expect(component.studentLoaded).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.loadError).toBe(false);
    expect(component.updateForm.value).toEqual({
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@mail.com'
    });
  });

  it('should set a load error state when getById fails', () => {
    studentServiceMock.getById.mockReturnValue(throwError(() => new Error('not found')));

    component.loadForm.setValue({ id: 999 });
    component.onLoad();

    expect(component.loadError).toBe(true);
    expect(component.loading).toBe(false);
  });

  it('should not call update when the update form is invalid', () => {
    component.onUpdate();

    expect(studentServiceMock.update).not.toHaveBeenCalled();
    expect(component.updateSubmitted).toBe(true);
  });

  it('should update the student on success', () => {
    studentServiceMock.update.mockReturnValue(of(student));

    component.loadForm.setValue({ id: 1 });
    component.updateForm.setValue({ firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@mail.com' });
    component.onUpdate();

    expect(studentServiceMock.update).toHaveBeenCalledWith(1, {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@mail.com'
    });
    expect(component.updateStatus).toBe('success');
    expect(component.isSubmitting).toBe(false);
  });

  it('should set an error state when update fails', () => {
    studentServiceMock.update.mockReturnValue(throwError(() => new Error('fail')));

    component.loadForm.setValue({ id: 1 });
    component.updateForm.setValue({ firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@mail.com' });
    component.onUpdate();

    expect(component.updateStatus).toBe('error');
    expect(component.isSubmitting).toBe(false);
  });

  it('should log out and navigate to /login', () => {
    jest.spyOn(authService, 'logout');
    jest.spyOn(router, 'navigate');

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});