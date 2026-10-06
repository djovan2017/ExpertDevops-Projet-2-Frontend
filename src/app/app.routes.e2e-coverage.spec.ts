import * as fs from 'fs';
import * as path from 'path';
import { Route } from '@angular/router';

import { routes } from './app.routes';

/**
 * TEST-GARDE — catégorie « Architecture ».
 *
 * Il ne teste PAS le comportement de l'application : il protège l'INTÉGRITÉ de la suite
 * Cypress e2e. Le builder esbuild d'Angular ne s'instrumente pas sans surcoût disproportionné,
 * donc les runs Cypress ne produisent aucune métrique de couverture et aucun seuil : rien
 * n'empêche la suite e2e de se dégrader silencieusement (spec supprimée, tests vidés).
 *
 * Ce fichier fait échouer `npm test` si :
 *   1. une route de l'app qui rend un composant n'est plus référencée par aucun spec
 *      `cypress/e2e/*.cy.ts` (ajouter une route FORCE donc à écrire son parcours e2e) ;
 *   2. le nombre de fichiers de specs e2e passe sous MIN_SPEC_FILES ;
 *   3. le nombre total de tests e2e passe sous MIN_E2E_TESTS.
 *
 * Les planchers sont un CLIQUET : on les monte quand un ajout légitime les dépasse, on ne
 * les baisse jamais sans justification explicite en revue.
 */

const E2E_DIR = path.join(process.cwd(), 'cypress', 'e2e');

// Planchers relevés le 2026-08-28 (9 fichiers, 26 tests). À incrémenter, pas à décrémenter.
const MIN_SPEC_FILES = 9;
const MIN_E2E_TESTS = 26;

/** Chemins complets des routes rendant un composant (hors redirections et wildcard `**`). */
function componentRoutePaths(routeList: Route[], parent = ''): string[] {
  const paths: string[] = [];
  for (const route of routeList) {
    if (route.path === undefined || route.path === '**') {
      continue;
    }
    const full = [parent, route.path].filter(Boolean).join('/');
    if (route.component) {
      paths.push('/' + full);
    }
    if (route.children) {
      paths.push(...componentRoutePaths(route.children, full));
    }
  }
  return paths;
}

function e2eSpecFiles(): string[] {
  return fs.readdirSync(E2E_DIR).filter((f) => f.endsWith('.cy.ts'));
}

const e2eSource = e2eSpecFiles()
  .map((f) => fs.readFileSync(path.join(E2E_DIR, f), 'utf8'))
  .join('\n');

describe('Architecture — intégrité de la suite Cypress e2e', () => {
  it.each(componentRoutePaths(routes))(
    'la route %s est ciblée par au moins un spec cypress/e2e',
    (routePath) => {
      // Segment complet uniquement : `/students` ne doit pas être "couvert" par `/students/liste`
      // (lookahead : le chemin n'est suivi ni d'un caractère de mot, ni d'un `/`).
      const referenced = new RegExp(routePath.replace(/[/\-]/g, '\\$&') + '(?![\\w/-])').test(e2eSource);
      expect(referenced).toBe(true);
    }
  );

  it(`compte au moins ${MIN_SPEC_FILES} fichiers de specs e2e`, () => {
    expect(e2eSpecFiles().length).toBeGreaterThanOrEqual(MIN_SPEC_FILES);
  });

  it(`compte au moins ${MIN_E2E_TESTS} tests e2e`, () => {
    const testCount = (e2eSource.match(/^\s*it(?:\.only)?\(/gm) || []).length;
    expect(testCount).toBeGreaterThanOrEqual(MIN_E2E_TESTS);
  });
});