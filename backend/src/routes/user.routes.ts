import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import { clerkRequireAuth, isClerkOwner } from '../middleware/clerk.middleware';
const router = Router();

// GET /users - Liste des utilisateurs
router.get('/', UserController.getAllUsers);

// GET /users/search?query=... - Rechercher des utilisateurs    
router.get('/search', UserController.searchUsers);

// GET /users/:id/stats/detailed - Statistiques détaillées d'un utilisateur
router.get('/:id/stats/detailed', UserController.getUserDetailedStats);
// GET /users/:id/stats - Statistiques d'un utilisateur
router.get('/:id/stats', UserController.getUserStats);
// GET /users/:id/reviews - Avis d'un utilisateur
router.get('/:id/reviews', UserController.getUserReviews);

// GET /users/:id - Détails d'un utilisateur
router.get('/:id', UserController.getUserById);

// POST /users - Créer un utilisateur
router.post('/',clerkRequireAuth, UserController.createUser);

// PUT /users/:id - Mettre à jour
router.put('/:id', clerkRequireAuth, isClerkOwner, UserController.updateUser);
// DELETE /users/:id - Supprimer un utilisateur
router.delete('/:id', clerkRequireAuth, isClerkOwner, UserController.deleteUser);

export default router;

