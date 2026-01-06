import { Router } from 'express';
import BookController from '../controllers/book.controller';

const router = Router();

// GET /books - Liste des livres
router.get('/', BookController.getAllBooks);

// GET /books/:id - Détails d'un livre
router.get('/:id', BookController.getBookById);

// POST /books - Créer un livre
router.post('/', BookController.createBook);

export default router;