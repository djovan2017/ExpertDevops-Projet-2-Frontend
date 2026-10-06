import { getHttpStatusText } from './http-status.util';

describe('getHttpStatusText', () => {
  it('should return the human-readable label for a known status code', () => {
    expect(getHttpStatusText(404)).toBe('Not Found');
  });

  it('should return "Erreur" for an unlisted status code', () => {
    expect(getHttpStatusText(999)).toBe('Erreur');
  });
});