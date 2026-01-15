## Installation et démarrage du projet

Le projet est composé de deux parties :
- un **backend Spring Boot** (port 8080)
- un **frontend Angular** (port 4200)

---

## Prérequis

### Outils requis
- Git
- Docker
- Docker Compose
- Java JDK 21
- Maven 3.9.3 ou supérieur
- Node.js (version LTS recommandée)
- npm

---

## Installation

Cloner le dépôt :

```bash
git clone https://github.com/LikeAKiwi-dev/testez-et-ameliorez-une-application-full-stack.git
cd testez-et-ameliorez-une-application-full-stack-main
```

Installer les dépendances du frontend :

```bash
cd front
npm install
```

---

## Démarrage du backend

### Pré-requis
- Docker Desktop doit être démarré sur la machine

### Lancement du backend

Depuis la racine du projet ou le dossier `back` :

```bash
mvn spring-boot:run
```

Cette commande permet :
- de démarrer automatiquement le conteneur Docker MySQL via Docker Compose
- de lancer l’application Spring Boot
- de connecter le backend à la base de données

Le backend est accessible à l’adresse suivante :

```text
http://localhost:8080
```

Sur Docker Desktop, un conteneur nommé `back_mysql` doit apparaître et être en état **Healthy**.

---

## Initialisation de la base de données

Une fois le conteneur MySQL démarré :

1. Ouvrir le conteneur `back_mysql` dans Docker Desktop
2. Aller dans l’onglet **Exec**
3. Se connecter à MySQL :

```bash
mysql -u user_test -p
```

Mot de passe :

```text
test_password
```

4. Sélectionner la base de données :

```sql
use test;
```

5. Insérer l’utilisateur administrateur :

```sql
INSERT INTO users(first_name, last_name, admin, email, password)
VALUES ('Admin', 'Admin', true, 'yoga@studio.com', '$2a$10$.Hsa/ZjUVaHqi0tp9xieMeewrnZxrZ5pQRzddUXE/WjDu2ZThe6Iq');
```

6. Vérifier l’insertion :

```sql
select * from users;
```

Utilisateur administrateur créé :
- Email : `yoga@studio.com`
- Mot de passe : `test!1234`

---

## Démarrage du frontend

Depuis le dossier `front` :

```bash
npm run start
```

Le frontend est accessible à l’adresse suivante :

```text
http://localhost:4200
```

Le frontend communique avec le backend via l’API exposée sur le port 8080.

---

## Ressources

### Collection Postman

Une collection Postman est disponible pour tester les endpoints backend :

```text
postman/yoga.postman_collection.json
```

Documentation officielle Postman :
https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman

## Tests et couverture de code

Cette section décrit l’exécution des tests unitaires, d’intégration et end-to-end,
ainsi que la génération des rapports de couverture, conformément aux exigences du projet.

---

## Frontend — Tests unitaires et d’intégration (Jest)

Les tests frontend sont réalisés avec **Jest**.

### Lancer les tests frontend

Depuis le dossier `front` :

```bash
npm run test
```

Cette commande exécute :
- les tests unitaires
- les tests d’intégration frontend

Les tests d’intégration représentent **au minimum 30 %** de l’ensemble des tests frontend.

---

### Générer le rapport de couverture frontend

```bash
npm run test:coverage
```

Le rapport de couverture est généré dans le dossier :

```text
front/coverage/jest/lcov-report/index.html
```

Les rapports démontrent un minimum de **80 % de couverture** pour chaque indicateur :
- instructions (statements)
- branches
- lignes
- fonctions

---

## Frontend — Tests End-to-End (Cypress)

Les tests end-to-end sont réalisés avec **Cypress** et couvrent chaque écran de l’application.

⚠️ **Pré-requis important**  
Les tests E2E sont configurés pour s’exécuter avec le navigateur **Microsoft Edge**.  
Edge doit donc être installé sur la machine avant l’exécution des tests.

### Lancer les tests E2E

Mode interactif :

```bash
npm run e2e
```

ou selon la configuration du projet :

```bash
npm run cypress:open
```

---

### Générer le rapport de couverture E2E

Les tests E2E doivent être exécutés avant de générer la couverture.

```bash
npm run e2e:coverage
```

Le rapport HTML est généré dans :

```text
front/coverage/lcov-report/index.html
```

Les rapports démontrent un minimum de **80 % de couverture** pour chaque indicateur :
- instructions
- branches
- lignes
- fonctions

---

## Backend — Tests unitaires et d’intégration (JUnit / Mockito)

Les tests backend sont réalisés avec **JUnit** et **Mockito**.

### Lancer les tests backend

Depuis le dossier `back` :

```bash
mvn test
```

Cette commande exécute :
- les tests unitaires backend
- les tests d’intégration backend

Les tests d’intégration représentent **au minimum 30 %** de l’ensemble des tests backend.

Le package **DTO n’est pas testé**, conformément aux consignes du projet.

---

### Générer le rapport de couverture backend

```bash
mvn verify
```

Cette commande :
- exécute l’ensemble des tests
- génère les rapports de couverture
- vérifie automatiquement le seuil minimum requis

Le rapport JaCoCo est disponible à l’emplacement suivant :

```text
back/target/site/jacoco/index.html
```

Les rapports démontrent un minimum de **80 % de couverture** pour chaque indicateur :
- instructions
- branches
- lignes

Si le seuil de couverture n’est pas atteint, la commande `mvn verify` échoue.

---

## Conformité aux exigences de couverture

Les seuils de couverture sont respectés pour :
- le frontend (tests unitaires et d’intégration)
- les tests end-to-end
- le backend (tests unitaires et d’intégration)

Chaque partie du projet atteint **au minimum 80 % de couverture** pour l’ensemble des indicateurs,
conformément aux critères d’évaluation OpenClassrooms.
