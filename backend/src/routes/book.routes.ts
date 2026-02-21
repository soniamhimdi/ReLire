import { Router } from 'express';
import BookController from '../controllers/book.controller';
import ListingController from '../controllers/listing.controller';

const router = Router();

// GET /books - Liste des livres
router.get('/', BookController.getAllBooks);
// GET /books/search?query=... - Rechercher des livres
router.get('/search', BookController.searchBooksAdvanced);
// GET /books/popular - Livres les plus populaires
router.get('/popular', BookController.getPopularBooks); 
// GET /books/stats/overview - Statistiques globales sur les livres
router.get('/stats/overview', BookController.getBooksStatistics); 
// GET /books/stats/condition - Répartition des livres par état
router.get('/stats/condition', BookController.getBooksConditionStats);
// GET /books/:id/listings - Annonces d'un livre
router.get('/:id/listings', ListingController.getListingsForBook);
// GET /books/:id - Détails d'un livre
router.get('/:id', BookController.getBookById);
// POST /books - Créer un livre
router.post('/', BookController.createBook);
// PUT /books/:id - Mettre à jour un livre
router.put('/:id', BookController.updateBook);
// DELETE /books/:id - Supprimer un livre
router.delete('/:id', BookController.deleteBook);


export default router;