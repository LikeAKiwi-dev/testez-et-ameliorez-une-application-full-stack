# Yoga

Projet OpenClassrooms – Mise en place de tests sur une application full-stack.

- Front Angular : tests unitaires + intégration avec Jest
- Front Angular : tests E2E avec Cypress + couverture Istanbul/NYC
- Back Java/Spring Boot : tests avec JUnit / Mockito + couverture JaCoCo (DTO exclu)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.16.

## Prérequis

- Node.js + npm
- Java + Maven
- (Optionnel) Angular CLI : `npm i -g @angular/cli`

> Remarque : sur certains postes, Cypress ne détecte pas Chrome. Les tests E2E sont configurés pour tourner avec Edge.

## Start the project

Git clone:

> git clone https://github.com/OpenClassrooms-Student-Center/P5-Full-Stack-testing

Go inside folder:

> cd yoga

## Installation

### Front
> cd front  
> npm install

### Back
> cd back  
> mvn clean install

## Lancer l’application

### Back-end
> cd back  
> mvn spring-boot:run

### Front-end
> cd front  
> npm run start

L’application est accessible sur `http://localhost:4200`.

## Tests

### Front – Tests unitaires & intégration (Jest)

Lancer les tests :

> cd front  
> npm run test

Mode watch :

> npm run test:watch

Générer la couverture Jest :

> npm run test -- --coverage

Rapport HTML Jest :

> front/coverage/jest/index.html

> Seuil minimal : 80% (statements) configuré via Jest.

### Front – Tests E2E (Cypress) + couverture (NYC)

Lancer les tests E2E (headless) :

> cd front  
> npm run e2e:ci

Générer le résumé de couverture (après exécution E2E) :

> npm run e2e:coverage

Générer le rapport HTML de couverture E2E :

> npx nyc report --reporter=html

Rapport HTML E2E :

> front/coverage/lcov-report/index.html

### Back – Tests (JUnit/Mockito) + couverture (JaCoCo)

Lancer les tests back :

> cd back  
> mvn test

Rapport HTML JaCoCo :

> back/target/site/jacoco/index.html

## Exigences de l’exercice

- Couverture minimale attendue : 80% minimum (instructions/statements, branches, functions, lines) sur chaque partie.
- Back-end : le package DTO est exclu (conformément à l’énoncé).
