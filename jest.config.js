module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>/src/'],
  testMatch: ['**/+(*.)+(spec).+(ts|js)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  testPathIgnorePatterns: [
    '<rootDir>/src/app/app.routes.e2e-coverage.spec.ts'
  ],

  collectCoverage: true,
  coverageReporters: ['html'],
};