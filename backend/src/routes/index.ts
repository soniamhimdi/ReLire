import { Router } from 'express';
import userRoutes from './user.routes';
import bookRoutes from './book.routes';
import listingRoutes from './listing.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/books', bookRoutes);
router.use('/listings', listingRoutes);

export default router;