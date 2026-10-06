# Projet 2 — Application de gestion des étudiants

Application full-stack de gestion des étudiants composée d'un **Back-end Spring Boot / Java 21** et d'un **Front-end Angular 19**.  
Le projet met en œuvre l'authentification JWT, les opérations CRUD sur les étudiants, des tests automatisés à plusieurs niveaux et des rapports de couverture consultables dans un navigateur.

---

## 📋 Sommaire

1. [Architecture générale](#-architecture-générale)
2. [Stack technique](#️-stack-technique)
3. [Fonctionnalités principales](#️-fonctionnalités-principales)
4. [API et authentification](#-api-et-authentification)
5. [Prérequis](#-prérequis)
6. [Installation et lancement](#-installation-et-lancement)
7. [Tests Back-end](#-tests-back-end)
8. [Couverture Back-end avec JaCoCo](#-couverture-back-end-avec-jacoco)
9. [Tests Front-end avec Jest](#-tests-front-end-avec-jest)
10. [Couverture Front-end Jest](#-couverture-front-end-jest)
11. [Tests E2E avec Cypress](#-tests-e2e-avec-cypress)
12. [Couverture E2E avec Istanbul / NYC](#-couverture-e2e-avec-istanbul--nyc)
13. [Rapport global des résultats](#-rapport-global-des-résultats)
14. [Démonstration rapide pour une soutenance](#-démonstration-rapide-pour-une-soutenance)

---

# 🎯 Contexte, objectifs et démarche du projet

Le projet consiste à reprendre des **starters code Back-end et Front-end**, à comprendre leur architecture et leurs interactions, puis à compléter progressivement l'application : correction de l'authentification, ajout du JWT, développement de l'interface de connexion, ajout des API CRUD étudiants, développement des écrans Angular correspondants, sécurisation de l'ensemble et mise en place d'une stratégie de tests automatisés.

La démarche suivie est volontairement progressive :

1. explorer les starters code sans les modifier ;
2. vérifier le démarrage du Back-end, de MySQL et du Front-end ;
3. vérifier la communication entre le Front-end et le Back-end ;
4. corriger l'API d'authentification `/api/login` ;
5. implémenter la génération et l'utilisation du token JWT ;
6. développer l'écran de connexion Angular ;
7. implémenter les API CRUD de gestion des étudiants ;
8. sécuriser les API et les routes Angular ;
9. développer les écrans CRUD ;
10. mettre en place les tests Back-end, Front-end et E2E ;
11. produire et analyser les rapports de couverture.

---

# 🔍 Étape 1 — Explorer les starters code

## Objectif

Cette première étape est consacrée à la lecture des codes Back-end et Front-end afin de comprendre l'architecture existante avant toute modification.

L'exploration porte notamment sur :

- l'organisation des fichiers ;
- les classes et composants principaux ;
- les couches Controller / Service / Repository ;
- les modèles et DTO ;
- les routes Angular ;
- les services Front-end ;
- la configuration Spring Security ;
- la configuration MySQL ;
- les interactions entre Angular, Spring Boot et la base de données.

## Prérequis

Avoir installé :

- **Java 21** ;
- **Maven 3.9.3** ;
- **Angular 19** ;
- Node.js et npm ;
- **Docker** ;
- **Docker Compose** ;
- Docker Desktop ou un moteur Docker compatible ;
- un IDE tel que VS Code ou IntelliJ.

Avoir également cloné et ouvert les starters code dans l'environnement de travail.

## Exploration du Back-end

Les fichiers et couches à examiner comprennent notamment :

```text
src/main/resources/application.yml
compose.yaml
Controller
Service
Repository
Entity
DTO
Configuration Spring Security
Services JWT
```

`application.yml` permet notamment d'identifier la configuration de la base de données et les variables d'environnement utilisées.

`compose.yaml` décrit l'environnement MySQL lancé avec Docker.

L'architecture générale d'un appel Back-end peut être représentée ainsi :

```text
Client
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
MySQL
```

À cette étape, l'objectif est de comprendre la logique existante et non de modifier immédiatement le code.

## Exploration du Front-end

Installer d'abord les dépendances :

```bash
cd Front-end
npm install
```

Puis parcourir :

```text
src/app/
```

Le Front-end est organisé autour de plusieurs responsabilités, notamment :

```text
core/
pages/
shared/
```

avec les services, guards, interceptors, modèles, pages et utilitaires nécessaires à l'application.

## Vérification du démarrage

Le Back-end doit pouvoir démarrer avec sa base de données, puis le Front-end doit pouvoir communiquer avec lui.

Back-end :

```bash
cd Back-end
mvn spring-boot:run
```

Front-end :

```bash
cd Front-end
npm run start
```

L'application Front-end est ensuite accessible sur :

```text
http://localhost:4200
```

Une première validation fonctionnelle consiste à ouvrir :

```text
http://localhost:4200/register
```

puis à enregistrer un nouvel utilisateur.

Le parcours vérifié est :

```text
Formulaire Angular
      ↓
API REST
      ↓
Spring Boot
      ↓
Service
      ↓
Repository
      ↓
MySQL
```

La création peut être contrôlée dans les logs Back-end et directement dans la base MySQL.

## Résultat attendu

À la fin de cette étape :

- l'architecture des starters Back-end et Front-end est comprise ;
- les applications démarrent normalement ;
- le Front-end communique avec le Back-end ;
- le Back-end communique avec MySQL ;
- l'enregistrement d'un utilisateur fonctionne.

## Points de vigilance

- ne pas se limiter à l'arborescence : lire également la logique du code ;
- ne pas modifier prématurément les starters ;
- vérifier les échanges réseau et les logs ;
- vérifier le comportement visuel, même si l'interface reste volontairement simple ;
- prendre des notes sur les zones nécessitant une analyse plus approfondie.

---

# 🔐 Étape 2 — Corriger l'API d'authentification Back-end

## Objectif

Corriger le service d'implémentation de l'authentification afin que :

```text
POST /api/login
```

fonctionne correctement et retourne un **token JWT** lorsque les identifiants sont valides.

## Prérequis

Avant cette étape, il faut avoir :

- exploré les starters ;
- identifié l'endpoint `/api/login` ;
- compris l'organisation Controller / Service ;
- compris le rôle de `UserService` et du service JWT.

## Démarche

Le code existant est d'abord débogué en suivant les appels entre les différentes classes.

Une attention particulière est portée à :

```text
UserController
      ↓
UserService.login(...)
      ↓
vérification du login
      ↓
vérification du mot de passe
      ↓
JwtService
      ↓
génération du token JWT
```

Des points d'arrêt peuvent être placés dans l'IDE afin d'observer les données et identifier les incohérences.

Le service `UserService.java`, notamment sa méthode `login`, doit correctement :

- retrouver l'utilisateur ;
- vérifier son mot de passe ;
- refuser les identifiants incorrects ;
- appeler le service JWT lorsque l'authentification réussit.

`JwtService.java` est chargé de générer le token.

## Résultat attendu

Avec des identifiants valides, l'API retourne un JWT.

Les situations invalides doivent être correctement gérées, notamment :

- login inconnu ;
- mot de passe incorrect ;
- informations invalides.

## Validation

La route peut être testée avec **Postman** avant son intégration au Front-end.

Dans le projet final, ce comportement est également couvert par les tests automatisés Back-end détaillés plus loin dans ce README.

## Points de vigilance

- conserver le découpage en couches ;
- respecter les conventions de nommage ;
- ne pas déplacer la logique métier dans le controller ;
- vérifier les réponses HTTP et les erreurs ;
- tester le comportement positif et les comportements d'échec.

---

# 🖥️ Étape 3 — Ajouter l'authentification dans Angular

## Objectif

Ajouter une interface permettant à l'utilisateur de s'authentifier depuis le Front-end et de consommer l'API `/api/login`.

## Prérequis

L'endpoint Back-end :

```text
POST /api/login
```

doit fonctionner et retourner un token JWT.

## Mise en œuvre

Un écran de connexion Angular permet de saisir le login et le mot de passe.

L'objectif visuel reste volontairement simple : la priorité est donnée à la manipulation correcte des données et à la communication avec le Back-end.

Le flux peut être résumé ainsi :

```text
LoginComponent
      ↓
service Angular
      ↓
POST /api/login
      ↓
Spring Boot
      ↓
JWT
      ↓
AuthService
      ↓
sessionStorage
```

Le JWT est conservé dans :

```text
sessionStorage
```

avec la clé :

```text
authToken
```

`AuthService` sert ensuite de source de vérité pour l'état d'authentification. Il permet notamment :

- d'enregistrer le token ;
- de récupérer le token ;
- de contrôler son expiration ;
- de déterminer si l'utilisateur est connecté ;
- de supprimer le token lors de la déconnexion.

## Gestion des états

L'interface prend en compte :

- la validation du formulaire ;
- le chargement ;
- le succès ;
- les erreurs serveur ;
- les identifiants incorrects ;
- l'expiration du token ;
- la déconnexion.

## Résultat attendu

L'utilisateur peut déclencher l'authentification depuis l'interface et le Front-end communique correctement avec le Back-end.

---

# 🔒 Sécurisation Front-end / Back-end

Les fonctionnalités de gestion des étudiants sont réservées aux utilisateurs authentifiés.

## Côté Back-end

Les API protégées nécessitent un token transmis dans l'en-tête HTTP :

```text
Authorization: Bearer <token>
```

Spring Security contrôle l'accès aux ressources.

## Côté Front-end

Les routes Angular protégées utilisent `authGuard`.

Le principe est :

```text
Navigation vers une route protégée
            ↓
        authGuard
            ↓
  AuthService.isLoggedIn()
            ↓
       JWT valide ?
       ├── oui → accès
       └── non → /login
```

L'intercepteur d'authentification ajoute le Bearer Token aux requêtes qui nécessitent une authentification.

---

# 👨‍🎓 Étape 4 — Ajouter les API CRUD étudiants

## Objectif

Ajouter les opérations CRUD nécessaires à la gestion des étudiants :

- **Create** : ajouter un étudiant ;
- **Read** : consulter la liste des étudiants ;
- **Read** : consulter le détail d'un étudiant ;
- **Update** : modifier un étudiant ;
- **Delete** : supprimer un étudiant.

## Architecture

Le découpage en couches est conservé :

```text
Requête HTTP
     ↓
Controller
     ↓
DTO
     ↓
Service
     ↓
Repository
     ↓
MySQL
```

Le controller gère les entrées et sorties HTTP.

Le service contient les traitements applicatifs.

Le repository gère l'accès aux données.

Les DTO sont utilisés pour les échanges afin de ne pas exposer directement les entités de persistance dans les controllers.

## Sécurité

Les API CRUD doivent être accessibles uniquement aux utilisateurs authentifiés.

Les appels protégés utilisent :

```text
Authorization: Bearer <JWT>
```

## Validation

Chaque route peut être validée avec Postman avant son intégration dans Angular.

Le projet final ajoute ensuite des tests automatisés sur ces opérations, notamment les tests CRUD, sécurité et intégrité des données.

---

# 🧑‍💻 Étape 5 — Développer les écrans CRUD Angular

## Objectif

Développer les écrans permettant de consommer les API CRUD précédentes.

Les fonctionnalités Front-end couvrent :

- le menu de gestion des étudiants ;
- l'ajout d'un étudiant ;
- la consultation de la liste ;
- la consultation détaillée ;
- la modification ;
- la suppression ;
- la déconnexion.

L'objectif principal n'est pas la sophistication graphique, mais la manipulation correcte des données et le fonctionnement de l'intégration Front-end / Back-end.

## Communication avec l'API

Le flux général est :

```text
Composant Angular
       ↓
Service étudiant
       ↓
HttpClient
       ↓
authInterceptor
       ↓
API Spring Boot
```

Les données envoyées par le Front-end correspondent aux DTO attendus par le Back-end.

## Protection des routes

Les écrans étudiants sont protégés par le Guard Angular.

Un utilisateur non authentifié ne doit pas pouvoir :

- créer un étudiant ;
- consulter la liste ;
- consulter un détail ;
- modifier un étudiant ;
- supprimer un étudiant.

Il est redirigé vers `/login`.

## Gestion des réponses HTTP

Les écrans affichent le résultat des opérations.

Exemples :

```text
201 Created
→ étudiant créé

200 OK
→ étudiant modifié

204 No Content
→ étudiant supprimé

404 Not Found
→ étudiant introuvable

409 Conflict
→ conflit sur les données
```

Un utilitaire partagé permet de traduire les codes HTTP en libellés compréhensibles.

---

# 🧪 Étape 6 — Mettre en place la stratégie de tests

Une fois les fonctionnalités Back-end et Front-end opérationnelles, le projet est validé à trois niveaux :

```text
                    Application
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
      JUnit/Maven      Jest         Cypress
          │             │             │
       Back-end      Front-end        E2E
          │             │             │
        JaCoCo       Coverage    Istanbul / NYC
```

Cette stratégie permet de vérifier :

- les unités de code ;
- les services ;
- les contrôleurs ;
- la sécurité ;
- l'authentification ;
- les accès aux données ;
- les composants Angular ;
- les guards et interceptors ;
- les parcours utilisateurs complets.

Les sections suivantes détaillent les commandes utilisées, l'exécution individuelle des tests, les campagnes complètes et les rapports de couverture.

---

# 📐 Architecture générale

```text
Projet_2/
├── Back-end/
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   └── test/
│   └── target/
│
├── Front-end/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   ├── guard/
│   │       │   ├── interceptors/
│   │       │   ├── models/
│   │       │   └── service/
│   │       ├── pages/
│   │       │   ├── login/
│   │       │   ├── register/
│   │       │   ├── student-menu/
│   │       │   ├── student-list/
│   │       │   ├── student-detail/
│   │       │   ├── create-student/
│   │       │   ├── update-student/
│   │       │   └── delete-student/
│   │       └── shared/
│   ├── cypress/
│   │   ├── e2e/
│   │   └── support/
│   ├── angular.json
│   ├── cypress.config.ts
│   ├── e2e-coverage-server.cjs
│   ├── proxy.conf.json
│   ├── .nycrc.json
│   └── package.json
│
└── README.md
```

Le Front-end reprend une organisation par `core`, `pages` et `shared`, avec des services dédiés à l'authentification et aux étudiants, ainsi que des pages distinctes pour les opérations CRUD.

---

# ⚙️ Stack technique

| Couche | Technologies |
|---|---|
| Back-end | Java 21, Spring Boot, Spring Security |
| Build Back-end | Maven |
| Base de données | MySQL |
| Tests Back-end | JUnit, Mockito, Testcontainers |
| Couverture Back-end | JaCoCo |
| Front-end | Angular 19, TypeScript |
| UI | Angular Material / Angular CDK |
| Réactivité | RxJS |
| Tests unitaires Front-end | Jest |
| Tests End-to-End | Cypress 16 |
| Couverture E2E | Istanbul / NYC |
| Conteneurs de test | Docker |

---

# 🖥️ Fonctionnalités principales

L'application permet notamment :

- l'inscription d'un utilisateur ;
- la connexion et la déconnexion ;
- la protection des routes authentifiées ;
- l'affichage de la liste des étudiants ;
- la consultation d'un étudiant ;
- la création d'un étudiant ;
- la modification d'un étudiant ;
- la suppression d'un étudiant ;
- l'affichage de messages de succès ou d'erreur associés aux réponses HTTP.

Le Front-end utilise également un utilitaire de traduction des codes HTTP afin d'afficher des informations compréhensibles à l'utilisateur, par exemple `201 Created`, `204 No Content`, `404 Not Found` ou `409 Conflict`.

---

# 🔌 API et authentification

En développement, les appels `/api/*` sont redirigés vers Spring Boot par `proxy.conf.json`.

Backend attendu :

```text
http://localhost:8080
```

Frontend :

```text
http://localhost:4200
```

Principales routes utilisées :

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/login` | Authentification |
| POST | `/api/register` | Création d'un compte |
| GET | `/api/students` | Liste des étudiants |
| GET | `/api/students/{id}` | Consultation d'un étudiant |
| POST | `/api/students` | Création |
| PUT | `/api/students/{id}` | Modification |
| DELETE | `/api/students/{id}` | Suppression |

> Selon la version de l'API utilisée, les routes métier peuvent être nommées `/api/etudiants` dans le Back-end. Les tests et le Front-end courant utilisent les routes configurées dans le projet.

## Authentification

Le JWT retourné après connexion est conservé dans :

```text
sessionStorage
```

avec la clé :

```text
authToken
```

`AuthService` vérifie la présence et l'expiration du token. Le `authGuard` protège les routes privées et l'intercepteur HTTP ajoute automatiquement :

```text
Authorization: Bearer <token>
```

aux requêtes authentifiées.

---

# 📦 Prérequis

Vérifier les outils :

```bash
java -version
mvn -version
node --version
npm --version
docker --version
docker ps
```

Le projet Back-end utilise **Java 21**.

Docker doit fonctionner pour les tests utilisant Testcontainers.

---

# 🚀 Installation et lancement

## 1. Back-end

```bash
cd Back-end
mvn spring-boot:run
```

Spring Boot démarre sur :

```text
http://localhost:8080
```

## 2. Front-end

Dans un deuxième terminal :

```bash
cd Front-end
npm install
npm start
```

Puis ouvrir :

```text
http://localhost:4200
```

Le proxy Angular transmet les appels `/api` au Back-end.

---

# 🧪 Tests Back-end

Les tests se trouvent dans :

```text
Back-end/src/test/java/
```

Ils couvrent notamment :

- les services ;
- les contrôleurs ;
- l'authentification ;
- JWT ;
- Spring Security ;
- les exceptions REST ;
- le CRUD étudiant ;
- l'intégrité des données ;
- l'accès à une véritable base MySQL avec Testcontainers.

## Exécuter toute la campagne

```bash
cd Back-end
mvn clean test
```

Résultat validé :

```text
Tests run: 47
Failures: 0
Errors: 0
Skipped: 0

BUILD SUCCESS
```

### Résultat

**47 / 47 tests réussis — 0 échec.**

## Exécuter une classe individuellement

```bash
mvn -Dtest=UserServiceTest test
```

Exemple validé : `UserServiceTest` exécute 6 scénarios avec succès.

## Exécuter une méthode individuellement

```bash
mvn -Dtest=UserServiceTest#login_withValidCredentials_shouldReturnToken test
```

Cette approche permet de diagnostiquer rapidement un comportement sans relancer toute la campagne.

---

# 📊 Couverture Back-end avec JaCoCo

La campagne Maven génère le rapport JaCoCo dans :

```text
Back-end/target/site/jacoco/index.html
```

Depuis `Back-end/` :

```bash
xdg-open target/site/jacoco/index.html
```

## Résultats obtenus

| Métrique | Résultat |
|---|---:|
| Instructions | **92 %** |
| Branches | **80 %** |
| Lignes | **~92 %** |
| Classes | **14 / 14 couvertes** |

Packages particulièrement bien couverts :

- contrôleurs : **100 %** ;
- gestion des exceptions : **100 %** ;
- plusieurs éléments de configuration : **100 %** ;
- sécurité : couverture élevée ;
- services : couverture élevée.

Le rapport JaCoCo permet de descendre jusqu'à la classe, la méthode, la ligne et la branche.

---

# 🧪 Tests Front-end avec Jest

Les tests Jest vérifient notamment :

- `AppComponent` ;
- `AuthService` ;
- le service étudiant ;
- `UserService` ;
- `authGuard` ;
- `authInterceptor` ;
- login ;
- register ;
- menu étudiant ;
- liste ;
- détail ;
- création ;
- modification ;
- suppression ;
- routes ;
- utilitaires HTTP.

## Exécuter toute la campagne

```bash
cd Front-end
npm test -- --runInBand
```

Résultat :

```text
Test Suites: 16 passed, 16 total
Tests:       76 passed, 76 total
```

### Résultat

**76 / 76 tests réussis — 0 échec.**

## Exécuter un fichier individuellement

```bash
npm test -- src/app/core/service/auth.service.spec.ts --runInBand
```

Exemple obtenu :

```text
1 suite passed
7 tests passed
```

## Exécuter un scénario individuellement

```bash
npm test -- src/app/core/service/auth.service.spec.ts \
  --runInBand \
  -t "should store the token in sessionStorage on setToken"
```

---

# 📊 Couverture Front-end Jest

```bash
npm test -- --runInBand --coverage
```

Rapport HTML :

```bash
xdg-open coverage/index.html
```

## Résultats obtenus

| Métrique | Couverture |
|---|---:|
| Statements | **96,83 %** |
| Branches | **71,79 %** |
| Functions | **95,65 %** |
| Lines | **96,63 %** |

Les statements, fonctions et lignes dépassent 95 %.  
La couverture des branches, à **71,79 %**, représente le principal axe d'amélioration de la campagne unitaire Front-end.

> La couverture Jest est indépendante de la couverture E2E Cypress. Les deux valeurs ne doivent pas être additionnées.

---

# 🌐 Tests E2E avec Cypress

Les specs se trouvent dans :

```text
Front-end/cypress/e2e/
```

Campagne actuelle :

```text
login.cy.ts
register.cy.ts
student-create.cy.ts
student-delete.cy.ts
student-detail.cy.ts
student-list.cy.ts
student-menu.cy.ts
student-update.cy.ts
```

Les scénarios couvrent l'authentification, la navigation et l'ensemble des opérations CRUD.

## Exécuter les E2E

Avec le Front-end disponible sur le port `4200` :

```bash
npm run e2e
```

## Exécuter une spec individuellement

```bash
npx cypress run \
  --e2e \
  --spec "cypress/e2e/student-menu.cy.ts" \
  --config screenshotOnRunFailure=false
```

Exemple validé :

```text
Tests:   5
Passing: 5
Failing: 0
```

## Résultats complets

| Spec | Tests | Résultat |
|---|---:|---:|
| `login.cy.ts` | 5 | **5/5** |
| `register.cy.ts` | 3 | **3/3** |
| `student-create.cy.ts` | 8 | **8/8** |
| `student-delete.cy.ts` | 9 | **9/9** |
| `student-detail.cy.ts` | 7 | **7/7** |
| `student-list.cy.ts` | 6 | **6/6** |
| `student-menu.cy.ts` | 5 | **5/5** |
| `student-update.cy.ts` | 11 | **11/11** |
| **TOTAL** | **54** | **54/54** |

Résultat Cypress :

```text
All specs passed!
54 tests
54 passing
0 failing
```

Durée observée de la campagne instrumentée complète : environ **5 min 48 s**.

---

# 📈 Couverture E2E avec Istanbul / NYC

Le projet mesure également la couverture du code Angular réellement parcouru par Cypress.

## Principe

```text
Code TypeScript Angular
        ↓
Build Angular development
        ↓
Instrumentation Istanbul / NYC
        ↓
dist-instrumented/
        ↓
Serveur instrumenté sur :4200
        ↓
Cypress
        ↓
window.__coverage__
        ↓
.nyc_output/*.json
        ↓
nyc report
        ↓
Rapport HTML
```

## 1. Construire Angular

```bash
cd Front-end

rm -rf dist
npx ng build --configuration development
```

Le bundle principal est généré dans :

```text
dist/student-frontend/browser/main.js
```

## 2. Préparer le build instrumenté

```bash
rm -rf dist-instrumented .instrumented-tmp

cp -R dist/student-frontend/browser dist-instrumented
```

## 3. Instrumenter avec NYC

```bash
npx nyc instrument \
  dist/student-frontend/browser \
  .instrumented-tmp \
  --produce-source-map
```

Puis :

```bash
cp .instrumented-tmp/main.js dist-instrumented/main.js
```

## 4. Vérifier l'instrumentation

```bash
grep -o "__coverage__" dist-instrumented/main.js | head
```

Résultat attendu :

```text
__coverage__
```

## 5. Démarrer le serveur instrumenté

Le Back-end doit être disponible sur `8080`.

Dans un terminal Front-end :

```bash
node e2e-coverage-server.cjs
```

Le serveur expose :

```text
Front E2E instrumenté : http://localhost:4200
Proxy API             : /api/* -> http://localhost:8080/api/*
```

## 6. Vérifier ce qui est réellement servi

Dans un deuxième terminal :

```bash
curl -s http://localhost:4200/main.js | grep -o "__coverage__" | head
```

Résultat attendu :

```text
__coverage__
```

Cette étape est importante : elle évite de lancer Cypress contre un ancien build ou contre `ng serve` non instrumenté.

## 7. Collecte de `window.__coverage__`

Après chaque scénario Cypress, les données Istanbul sont récupérées depuis le navigateur puis écrites dans :

```text
.nyc_output/
```

Lors d'une spec de 5 tests, on obtient par exemple :

```text
coverage-0.json
coverage-1.json
coverage-2.json
coverage-3.json
coverage-4.json
```

## 8. Campagne complète

```bash
npm run e2e:coverage
```

Le script enchaîne :

```text
e2e:clean
   ↓
e2e
   ↓
e2e:report
   ↓
e2e:check
```

Configuration NYC :

```json
{
  "temp-dir": ".nyc_output",
  "report-dir": "coverage",
  "reporter": [
    "text-summary",
    "html"
  ],
  "check-coverage": true,
  "statements": 80,
  "branches": 80,
  "functions": 80,
  "lines": 80
}
```

## Résultats de couverture E2E

```text
Statements : 95.30 % (284/298)
Branches   : 85.86 % (79/92)
Functions  : 97.46 % (77/79)
Lines      : 95.08 % (271/285)
```

| Métrique | Seuil | Résultat | Statut |
|---|---:|---:|---|
| Statements | 80 % | **95,30 %** | ✅ |
| Branches | 80 % | **85,86 %** | ✅ |
| Functions | 80 % | **97,46 %** | ✅ |
| Lines | 80 % | **95,08 %** | ✅ |

`nyc check-coverage` termine sans erreur : **les quatre seuils sont respectés**.

## Afficher le rapport

```bash
xdg-open coverage/index.html
```

---

# 🧹 Rapport E2E centré sur le code applicatif

`src/main.ts` contient uniquement le bootstrap Angular :

```ts
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

Pour une présentation centrée sur la logique applicative, ce fichier peut être retiré du rapport final après remapping des source maps.

## Générer le JSON remappé

```bash
npx nyc report --reporter=json
```

Le fichier produit est :

```text
coverage/coverage-final.json
```

## Retirer uniquement `src/main.ts`

```bash
node - <<'NODE'
const fs = require('fs');

const file = 'coverage/coverage-final.json';
const coverage = JSON.parse(fs.readFileSync(file, 'utf8'));

for (const key of Object.keys(coverage)) {
  if (key.endsWith('/src/main.ts')) {
    delete coverage[key];
  }
}

fs.writeFileSync(file, JSON.stringify(coverage));
NODE
```

## Générer le rapport HTML filtré

```bash
rm -rf .nyc_filtered coverage-filtered
mkdir .nyc_filtered

cp coverage/coverage-final.json .nyc_filtered/coverage.json

npx nyc report \
  --temp-dir .nyc_filtered \
  --report-dir coverage-filtered \
  --reporter=html \
  --reporter=text-summary \
  --check-coverage=false
```

Puis :

```bash
xdg-open coverage-filtered/index.html
```

Le rapport commence alors directement par le code applicatif :

```text
app
app/core/guard
app/core/interceptors
app/core/service
app/pages/...
```

> Ce filtrage est destiné à la lisibilité du rapport de présentation. Les seuils de qualité doivent être validés sur la campagne complète avec `npm run e2e:check`.

---

# 📑 Rapport global des résultats

## Tests

| Niveau | Outil | Exécutés | Réussis | Échecs |
|---|---|---:|---:|---:|
| Back-end | JUnit / Maven | 47 | **47** | 0 |
| Front-end | Jest | 76 | **76** | 0 |
| E2E | Cypress | 54 | **54** | 0 |
| **TOTAL** | | **177** | **177** | **0** |

### Bilan

```text
Tests exécutés : 177
Tests réussis  : 177
Tests échoués  : 0
Taux de succès : 100 %
```

## Couverture

| Campagne | Statements / Instructions | Branches | Functions | Lines |
|---|---:|---:|---:|---:|
| Back-end — JaCoCo | **92 % instructions** | **80 %** | — | **~92 %** |
| Front-end — Jest | **96,83 %** | **71,79 %** | **95,65 %** | **96,63 %** |
| E2E — Cypress / NYC | **95,30 %** | **85,86 %** | **97,46 %** | **95,08 %** |

Ces trois couvertures correspondent à des périmètres différents et ne doivent pas être additionnées.

---

# 🔎 Analyse des résultats

## Back-end

La campagne de **47 tests** valide les principales couches Spring Boot. Les tests d'accès aux données utilisent Testcontainers et une véritable instance MySQL temporaire, ce qui permet de vérifier le comportement de la couche de persistance dans un environnement proche d'une base réelle.

La couverture JaCoCo atteint **92 % des instructions** et **80 % des branches**.

## Front-end unitaire

Les **76 tests Jest** valident les composants, services, guards, interceptors, routes et utilitaires.

Les statements, fonctions et lignes sont couverts à plus de **95 %**. La couverture des branches (**71,79 %**) montre qu'il reste des chemins conditionnels qui pourraient être complétés par de nouveaux tests.

## End-to-End

Les **54 scénarios Cypress** valident les principaux parcours utilisateur : authentification, inscription, navigation et CRUD étudiant.

La couverture E2E dépasse les quatre seuils NYC de **80 %**, avec notamment **95,08 % des lignes** et **97,46 % des fonctions**.

---

# ⚠️ Points d'attention

## Reconstruction du build instrumenté

Lorsque le code Angular change, il faut reconstruire puis réinstrumenter `dist-instrumented`.

Un build instrumenté obsolète peut conduire Cypress à tester une ancienne version de l'application.

La procédure correcte est donc :

```text
modification Angular
      ↓
ng build
      ↓
nyc instrument
      ↓
redémarrage e2e-coverage-server.cjs
      ↓
Cypress
```

## Rapports Jest et NYC

Jest et NYC peuvent utiliser le même répertoire :

```text
coverage/
```

Une nouvelle campagne peut donc remplacer le rapport précédent.

Pour une démonstration, générer et consulter les rapports l'un après l'autre, ou configurer à terme des répertoires distincts tels que :

```text
coverage/jest/
coverage/e2e/
```

---

# 🎓 Démonstration rapide pour une soutenance

## 1. Démarrer le Back-end

```bash
cd Back-end
mvn spring-boot:run
```

## 2. Démarrer le Front-end

```bash
cd Front-end
npm start
```

Ouvrir :

```text
http://localhost:4200
```

## 3. Montrer un test Back-end individuel

```bash
cd Back-end
mvn -Dtest=UserServiceTest test
```

Puis toute la campagne :

```bash
mvn clean test
```

Rapport :

```bash
xdg-open target/site/jacoco/index.html
```

## 4. Montrer un test Front-end individuel

```bash
cd Front-end

npm test -- src/app/core/service/auth.service.spec.ts \
  --runInBand
```

Puis toute la campagne :

```bash
npm test -- --runInBand --coverage
```

Rapport :

```bash
xdg-open coverage/index.html
```

## 5. Montrer une spec Cypress individuelle

Après démarrage du serveur approprié :

```bash
npx cypress run \
  --e2e \
  --spec "cypress/e2e/student-menu.cy.ts" \
  --config screenshotOnRunFailure=false
```

Résultat attendu :

```text
5 passing
0 failing
```

## 6. Montrer la campagne E2E complète

Avec le bundle instrumenté servi sur `4200` :

```bash
npm run e2e:coverage
```

Résultat :

```text
54 tests
54 passing
0 failing

Statements : 95.30 %
Branches   : 85.86 %
Functions  : 97.46 %
Lines      : 95.08 %
```

Puis :

```bash
xdg-open coverage/index.html
```

---

# ✅ Conclusion

Le projet met en œuvre une stratégie de test à plusieurs niveaux :

1. **JUnit / Maven** vérifie le Back-end Spring Boot ;
2. **Jest** vérifie les unités et intégrations du Front-end Angular ;
3. **Cypress** valide les parcours utilisateur ;
4. **JaCoCo** mesure la couverture Java ;
5. **Istanbul / NYC** mesure la couverture Angular pendant les parcours E2E.

Résultat global validé :

```text
177 tests exécutés
177 tests réussis
0 échec
100 % de réussite
```

Les rapports de couverture fournissent en complément une mesure détaillée de la qualité de la campagne de tests et permettent d'identifier les branches ou chemins qui pourraient encore être améliorés.
