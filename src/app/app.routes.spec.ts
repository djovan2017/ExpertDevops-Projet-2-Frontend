import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { routes } from './app.routes';

describe('routes (wildcard fallback)', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)]
    });
    router = TestBed.inject(Router);
  });

  it('should redirect to /login for an unknown route under /students (students/xxx)', async () => {
    await router.navigateByUrl('/students/xxx');

    expect(router.url).toBe('/login');
  });

  it('should redirect to /login for students/detail/yyy (no :id segment defined on "detail")', async () => {
    await router.navigateByUrl('/students/detail/yyy');

    expect(router.url).toBe('/login');
  });
});