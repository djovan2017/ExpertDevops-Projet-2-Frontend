import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { StudentService} from './student.service';
import { Student } from '../models/Student';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  const student: Student = { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@mail.com' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      // StudentServiceinjecte HttpClient : sans ce provider, TestBed.inject
      // échoue avec un NullInjectorError.
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAll should GET /api/students', () => {
    service.getAll().subscribe((result) => {
      expect(result).toEqual([student]);
    });

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('GET');
    req.flush([student]);
  });

  it('getById should GET /api/students/:id', () => {
    service.getById(1).subscribe((result) => {
      expect(result).toEqual(student);
    });

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('GET');
    req.flush(student);
  });

  it('create should POST /api/students with the payload', () => {
    service.create(student).subscribe((result) => {
      expect(result).toEqual(student);
    });

    const req = httpMock.expectOne('/api/students');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(student);
    req.flush(student);
  });

  it('update should PUT /api/students/:id with the payload', () => {
    service.update(1, student).subscribe((result) => {
      expect(result).toEqual(student);
    });

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(student);
    req.flush(student);
  });

  it('delete should DELETE /api/students/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('/api/students/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});