/** Étudiant tel qu'échangé avec l'API (`/api/students`). `id` est absent avant création. */
export interface Student {
  id?: number,
  firstName: string,
  lastName: string,
  email: string
}