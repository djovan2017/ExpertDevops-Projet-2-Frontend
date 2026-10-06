import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/Student';

/** Accès CRUD à l'API REST `/api/students`. Aucune logique métier : un simple passe-plat HTTP. */
@Injectable({
  providedIn: 'root'
})
export class StudentService {
  constructor(private httpClient: HttpClient) { }

  getAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>('/api/students');
  }

  getById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`/api/students/${id}`);
  }

  create(student: Student): Observable<Student> {
    return this.httpClient.post<Student>('/api/students', student);
  }

  /** Remplacement complet de l'étudiant `id` par `student` (PUT, pas de patch partiel). */
  update(id: number, student: Student): Observable<Student> {
    return this.httpClient.put<Student>(`/api/students/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/students/${id}`);
  }
}