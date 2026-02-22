import { Router } from 'express';
import ListingController from '../controllers/listing.controller.js';
import { clerkRequireAuth, isClerkOwner } from '../middleware/clerk.middleware';
const router = Router();

// GET /listings - Liste des annonces
router.get('/', ListingController.getAllListings);

// GET /listings/search?query=... - Rechercher des annonces
router.get('/search', ListingController.searchListingsAdvanced);
// GET /listings/stats - Statistiques globales des annonces
router.get('/stats', ListingController.getListingsStatistics);
// GET /listings/recommended - Annonces recommandées pour un utilisateur - Query params: userId, limit
router.get('/recommended', ListingController.getRecommendedListings);

// GET /listings/:id - Détails d'une annonce
router.get('/:id', ListingController.getListingById);
// Routes protégées
// POST /listings - Créer une annonce
router.post('/', clerkRequireAuth, ListingController.createListing);

// PUT /listings/:id - Mettre à jour
router.put('/:id', clerkRequireAuth, isClerkOwner, ListingController.updateListing);

// DELETE /listings/:id - Supprimer
router.delete('/:id', clerkRequireAuth, isClerkOwner, ListingController.deleteListing);

// PATCH /listings/:id/status - Mettre à jour le statut
router.patch('/:id/status', clerkRequireAuth, ListingController.updateListingStatus);

export default router;