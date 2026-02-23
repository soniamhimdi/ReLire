import type { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import prisma from '../prisma/prisma.js';

// Interface pour la requête avec utilisateur Clerk
export interface ClerkRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
    claims?: any;
  };
}

// Middleware de base (attache l'auth à req, ne bloque pas)
export const clerkAuth = clerkMiddleware();

// Middleware qui bloque les utilisateurs non authentifiés
export const clerkRequireAuth = requireAuth();

// Helper pour récupérer l'userId
export const getUserId = (req: ClerkRequest): string | null => {
  return req.auth?.userId || null;
};

// Middleware pour vérifier si l'utilisateur est le propriétaire
export const isClerkOwner = async (req: ClerkRequest, res: Response, next: NextFunction) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({ error: 'Non authentifie' });
  }

  const resourceId = Number(req.params.id);
  if (!Number.isFinite(resourceId)) {
    return res.status(400).json({ error: 'Identifiant invalide' });
  }

  try {
    if (req.baseUrl.includes('/users')) {
      const user = await prisma.user.findUnique({
        where: { id: resourceId },
        select: { clerkId: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouve' });
      }

      if (user.clerkId !== userId) {
        return res.status(403).json({ error: 'Acces interdit' });
      }

      return next();
    }

    if (req.baseUrl.includes('/listings')) {
      const listing = await prisma.listing.findUnique({
        where: { id: resourceId },
        select: { user: { select: { clerkId: true } } },
      });

      if (!listing) {
        return res.status(404).json({ error: 'Annonce non trouvee' });
      }

      if (listing.user.clerkId !== userId) {
        return res.status(403).json({ error: 'Acces interdit' });
      }

      return next();
    }

    return res.status(403).json({ error: 'Acces interdit' });
  } catch (error) {
    console.error('Erreur isClerkOwner:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Ancienne version 
// export const isClerkOwner = (resourceUserId: string) => {
//   return (req: ClerkRequest, res: Response, next: NextFunction) => {
//     const userId = getUserId(req);
//
//     if (!userId) {
//       return res.status(401).json({ error: 'Non authentifie' });
//     }
//
//     if (userId !== resourceUserId) {
//       return res.status(403).json({ error: 'Acces interdit' });
//     }
//
//     next();
//   };
// };