import type { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth, requireAuth } from '@clerk/express';

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
export const isClerkOwner = (resourceUserId: string) => {
  return (req: ClerkRequest, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (userId !== resourceUserId) {
      return res.status(403).json({ error: 'Accès interdit' });
    }

    next();
  };
};