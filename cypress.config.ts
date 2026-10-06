import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';

let coverageIndex = 0;

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',

    setupNodeEvents(on, config) {
      on('task', {
        saveCoverage(coverage: object) {
          const outputDir = path.join(config.projectRoot, '.nyc_output');

          fs.mkdirSync(outputDir, { recursive: true });

          const outputFile = path.join(
            outputDir,
            `coverage-${coverageIndex++}.json`
          );

          fs.writeFileSync(
            outputFile,
            JSON.stringify(coverage),
            'utf8'
          );

          return null;
        }
      });

      return config;
    },
  },
});