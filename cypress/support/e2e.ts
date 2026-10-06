// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
//import '@cypress/code-coverage/support';

afterEach(() => {
  cy.window({ log: false }).then((win) => {
    const coverage = (win as any).__coverage__;

    if (coverage) {
      cy.task('saveCoverage', coverage, { log: false });
    }
  });
});