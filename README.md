# ReLire - Backend API

## Description

Marketplace C2C de livres d'occasion avec spécialisation éducative.

## Technologies

- Node.js 18+
- Express.js
- TypeScript (strict mode)
- PostgreSQL via Neon.tech
- Prisma ORM

## Installation

1. Cloner le dépôt
2. `npm install`
3. Copier `.env.example` vers `.env`
4. Configurer DATABASE_URL Neon
5. `npx prisma migrate dev`
6. `npm run seed`
7. `npm run dev`

## Structure MVC

- `/src/controllers` - Logique métier
- `/src/models` - Types TypeScript
- `/src/routes` - Endpoints API
- `/src/prisma` - Configuration DB

## Tests

Importez `tests/ReLire.postman_collection.json` dans Postman

## Auteur

[Sonia Mhimdi] - Collège de Maisonneuve - Automne 2025
