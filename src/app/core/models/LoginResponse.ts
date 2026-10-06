/** Réponse de `POST /api/login` ; `token` est le JWT à transmettre ensuite via l'en-tête Authorization. */
export interface LoginResponse {
  status: string,
  message: string,
  token: string
}