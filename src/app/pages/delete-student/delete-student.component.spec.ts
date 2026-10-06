import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentDeleteComponent } from './delete-student.component';
import { StudentService } from '../../core/service/student.service';
import { AuthService } from '../../core/service/auth.service';

describe('StudentDeleteComponent', () => {
  let component: StudentDeleteComponent;
  let fixture: ComponentFixture<StudentDeleteComponent>;
  let StudentServiceMock: { delete: jest.Mock };
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    StudentServiceMock = { delete: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [StudentDeleteComponent],
      providers: [
        provideRouter([]),
        { provide: StudentService, useValue: StudentServiceMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentDeleteComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the form controls via the form getter', () => {
    expect(component.form).toBe(component.deleteForm.controls);
  });

  it('should not call delete when the form is invalid', () => {
    component.onSubmit();

    expect(StudentServiceMock.delete).not.toHaveBeenCalled();
    expect(component.submitted).toBe(true);
  });

  it('should delete the student and reset the form on success', () => {
    StudentServiceMock.delete.mockReturnValue(of(null));

    component.deleteForm.setValue({ id: 1 });
    component.onSubmit();

    expect(StudentServiceMock.delete).toHaveBeenCalledWith(1);
    expect(component.deleteStatus).toBe('success');
    expect(component.isSubmitting).toBe(false);
    expect(component.submitted).toBe(false);
    expect(component.deleteForm.value).toEqual({ id: null });
  });

  it('should set an error state when delete fails', () => {
    StudentServiceMock.delete.mockReturnValue(throwError(() => new Error('fail')));

    component.deleteForm.setValue({ id: 1 });
    component.onSubmit();

    expect(component.deleteStatus).toBe('error');
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