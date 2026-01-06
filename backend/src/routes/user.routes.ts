import { Router } from 'express';
import UserController from '../controllers/user.controller';

const router = Router();

// GET /users - Liste des utilisateurs
router.get('/', UserController.getAllUsers);

// GET /users/:id - Détails d'un utilisateur
router.get('/:id', UserController.getUserById);

// POST /users - Créer un utilisateur
router.post('/', UserController.createUser);

// PUT /users/:id - Mettre à jour
router.put('/:id', UserController.updateUser);

export default router;