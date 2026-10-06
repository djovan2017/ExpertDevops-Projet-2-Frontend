const HTTP_STATUS_TEXTS: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error'
};

/** Libellé humain d'un code HTTP pour l'affichage ; `'Erreur'` si le code n'est pas listé. */
export function getHttpStatusText(status: number): string {
  return HTTP_STATUS_TEXTS[status] ?? 'Erreur';
}