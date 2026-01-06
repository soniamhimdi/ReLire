import { Router } from 'express';
import ListingController from '../controllers/listing.controller';

const router = Router();

// GET /listings - Liste des annonces
router.get('/', ListingController.getAllListings);

// GET /listings/:id - Détails d'une annonce
router.get('/:id', ListingController.getListingById);

// POST /listings - Créer une annonce
router.post('/', ListingController.createListing);

// PUT /listings/:id - Mettre à jour
router.put('/:id', ListingController.updateListing);

// DELETE /listings/:id - Supprimer
router.delete('/:id', ListingController.deleteListing);

export default router;