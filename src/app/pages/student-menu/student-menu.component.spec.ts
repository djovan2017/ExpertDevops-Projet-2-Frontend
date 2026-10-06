import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { StudentMenuComponent } from './student-menu.component';
import { AuthService } from '../../core/service/auth.service';

describe('StudentMenuComponent', () => {
  let component: StudentMenuComponent;
  let fixture: ComponentFixture<StudentMenuComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentMenuComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentMenuComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the list of student actions', () => {
    expect(component.actions.length).toBe(5);
    expect(component.actions[0]).toEqual({ label: 'Liste des étudiants', path: '/students/liste' });
  });

  it('should log out and navigate to /login', () => {
    jest.spyOn(authService, 'logout');
    jest.spyOn(router, 'navigate');

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});