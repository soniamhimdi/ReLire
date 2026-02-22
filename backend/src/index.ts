import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkAuth } from './middleware/clerk.middleware'; // Import du middleware Clerk

// Routes
import userRoutes from './routes/user.routes';
import bookRoutes from './routes/book.routes';
import listingRoutes from './routes/listing.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

//app.options('*', cors());

app.use(express.json());

// Clerk middleware - REQUIRED for all auth-protected routes
app.use(clerkAuth);

// Routes publiques
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur ReLire API' });
});


// Middleware
// app.use(cors());
// app.use(express.json());

// Route de base
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Bienvenue sur l\'API ReLire 📚',
//     version: '1.0.0',
//     endpoints: {
//       users: '/users',
//       books: '/books',
//       listings: '/listings'
//     }
//   });
// });

// Routes API
app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use('/listings', listingRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
