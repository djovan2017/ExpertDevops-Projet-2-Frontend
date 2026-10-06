const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

const PORT = 4200;
const BACKEND = 'http://localhost:8080';
const DIST = path.join(__dirname, 'dist-instrumented');

/*
 * Proxy vers Spring Boot.
 *
 * Important :
 * on intercepte globalement les requêtes correspondant à /api
 * afin que le backend reçoive bien :
 *
 *   /api/login
 *   /api/register
 *   /api/etudiants
 *   ...
 *
 * et non /login, /register, etc.
 */
app.use(
  createProxyMiddleware({
    target: BACKEND,
    changeOrigin: true,
    pathFilter: '/api/**'
  })
);

// Fichiers Angular instrumentés.
app.use(express.static(DIST));

// Fallback Angular SPA.
// Exemple : /login, /etudiants, /etudiants/creer...
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Front E2E instrumenté : http://localhost:${PORT}`);
  console.log(`Proxy API            : /api/* -> ${BACKEND}/api/*`);
});