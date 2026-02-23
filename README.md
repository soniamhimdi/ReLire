# ReLire

## 1. Description du projet
- Lien GitHub : https://github.com/soniamhimdi/ReLire
- Objectif : Marketplace C2C de livres d'occasion avec specialisation educative.
- Fonctionnalites principales :
  - Gestion des livres, des annonces et des utilisateurs
  - Authentification via Clerk
  - API backend (Node.js/Express) + interface frontend (React/Vite)

## 2. Technologies utilisees (avec versions)
### Backend
- Node.js (recommande 18+)
- Express ^5.2.1
- Cors ^2.8.6
- TypeScript ^5.9.3
- Prisma ^7.2.0
- @prisma/client ^7.2.0
- @prisma/adapter-neon ^7.2.0
- PostgreSQL (via Neon)

### Frontend
- React ^19.2.0
- React DOM ^19.2.0
- React Router DOM ^7.13.0
- Vite ^7.3.1
- @mui/material ^7.3.8
- Axios ^1.13.5
- @clerk/clerk-react ^5.61.0

## 3. Instructions d'installation
1. Cloner le depot : `git clone https://github.com/soniamhimdi/ReLire.git`
2. Backend :
   - `cd backend`
   - `npm install`
   - Copier `.env.example` vers `.env` et remplir les variables
   - `npx prisma generate`
   - `npx prisma migrate dev`
   - `npm run seed`
   - `npm run dev`
3. Frontend :
   - `cd frontend`
   - `npm install`
   - `npm run dev`
4. Ouvrir le frontend sur http://localhost:3001

## 4. Variables d'environnement
Fichier attendu : `backend/.env`
- `PORT` : Port du serveur API
- `FRONTEND_URL` : URL du frontend pour CORS (ex. http://localhost:3001)
- `DATABASE_URL` : URL de connexion PostgreSQL
- `CLERK_SECRET_KEY` : Cle secrete Clerk (backend)
- `CLERK_PUBLISHABLE_KEY` : Cle publique Clerk (frontend)
- `NODE_ENV` : Environnement d'execution (development, production, etc.)

## 6. Auteur(s)
- Sonia Mhimdi [2595653] - Collège de Maisonneuve - Automne 2025
