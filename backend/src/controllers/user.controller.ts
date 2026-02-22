//import { Request, Response } from 'express';
//import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import prisma from '../prisma/prisma.js';

//const prisma = new PrismaClient();

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          userType: true,
          location: true,
          rating: true,
          role: true,
          createdAt: true
        }
      });
      
      res.json(users);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  async getUserById(req: Request, res: Response) {
    try {
            const id = Number(req.params.id);
      
    
    //   const userId = parseInt(id);
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          userType: true,
          location: true,
          rating: true,
          role: true,
          createdAt: true,
          listings: {
            select: {
              id: true,
              price: true,
              condition: true,
              status: true,
              createdAt: true
            }
          }
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  async createUser(req: Request, res: Response) {
    try {
      const { email, name, userType, location, clerkId } = req.body;
      
      if (!email || !name || !userType) {
        return res.status(400).json({ error: 'Email, nom et type requis' });
      }
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email déjà utilisé' });
      }
      
      const user = await prisma.user.create({
        data: { email, name, userType, location, clerkId },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          userType: true,
          location: true,
          rating: true,
          role: true,
          createdAt: true
        }
      });
      
      res.status(201).json(user);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  async updateUser(req: Request, res: Response) {
    try {
            const id = Number(req.params.id);
    //   const { id } = req.params;
    //   const userId = parseInt(id);
      const { name, location } = req.body;
      
      const user = await prisma.user.update({
        // where: { id: userId },
        where: { id },
        data: { name, location },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          userType: true,
          location: true,
          rating: true,
          role: true,
          createdAt: true
        }
      });
      
      res.json(user);
    } catch (error: any) {
      console.error('Erreur:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   * SUPPRIMER un utilisateur
   * DELETE /users/:id
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id);
      // const { id } = req.params;
      // const userId = parseInt(id);
      
      // Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          listings: { where: { status: 'ACTIVE' } },
          purchases: { where: { status: 'PENDING' } },
          sales: { where: { status: 'PENDING' } }
        }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      // Vérifier les contraintes avant suppression
      if (user.listings.length > 0) {
        return res.status(400).json({ 
          error: 'Impossible de supprimer, annonces actives existantes' 
        });
      }
      
      if (user.purchases.length > 0 || user.sales.length > 0) {
        return res.status(400).json({ 
          error: 'Impossible de supprimer, transactions en cours' 
        });
      }
      
      // Soft delete : archiver plutôt que supprimer
      // Ou suppression complète si vraiment nécessaire
      await prisma.user.delete({
        where: { id: userId }
      });
      
      res.json({ 
        message: 'Utilisateur supprimé avec succès',
        userId: userId 
      });
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   * RECHERCHER des utilisateurs par type
   * GET /users/search?type=TEACHER&location=Montréal
   */
  async searchUsers(req: Request, res: Response) {
    try {
      const { type, location, minRating, page = '1', limit = '20', email, clerkId } = req.query;

      // Direct lookup when clerkId/email is provided to avoid mismatched profiles
      if (clerkId || email) {
        const user = await prisma.user.findFirst({
          where: {
            ...(clerkId ? { clerkId: clerkId as string } : {}),
            ...(email ? { email: { equals: email as string, mode: 'insensitive' } } : {})
          },
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            userType: true,
            location: true,
            rating: true,
            createdAt: true
          }
        });

        return res.json({
          data: user ? [user] : [],
          pagination: {
            page: 1,
            limit: 1,
            total: user ? 1 : 0,
            totalPages: user ? 1 : 0
          },
          filters: { clerkId, email }
        });
      }
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      
      // Construire les filtres
      const where: any = {};
      
      if (type) where.userType = type;
      if (location) where.location = { contains: location, mode: 'insensitive' };
      if (minRating) where.rating = { gte: parseFloat(minRating as string) };
      
      // Recherche avec pagination
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limitNum,
          select: {
            id: true,
            name: true,
            email: true,
            userType: true,
            location: true,
            rating: true,
            //transactionCount: true,
            createdAt: true
          },
          orderBy: { rating: 'desc' }
        }),
        prisma.user.count({ where })
      ]);
      
      res.json({
        data: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        },
        filters: {
          type,
          location,
          minRating
        }
      });
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  /**
   * STATISTIQUES d'un utilisateur
   * GET /users/:id/stats
   */
  async getUserStats(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id);

      // Vérifier que l'utilisateur existe
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!userExists) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      const [totalListings, totalSales, totalPurchases, reviewStats] = await Promise.all([
        prisma.listing.count({
          where: { userId }
        }),
        prisma.transaction.count({
          where: { sellerId: userId, status: 'COMPLETED' }
        }),
        prisma.transaction.count({
          where: { buyerId: userId, status: 'COMPLETED' }
        }),
        prisma.review.aggregate({
          where: { revieweeId: userId },
          _avg: { rating: true },
          _count: { rating: true }
        })
      ]);

      res.json({
        totalListings,
        totalSales,
        totalPurchases,
        totalTransactions: totalSales + totalPurchases,
        averageRating: reviewStats._avg.rating ?? 0,
        totalReviews: reviewStats._count.rating
      });
    } catch (error) {
      console.error('Erreur stats utilisateur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   * VÉRIFIER les avis d'un utilisateur
   * GET /users/:id/reviews
   */
  async getUserReviews(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id);
      // const { id } = req.params;
      // const userId = parseInt(id);
      
      const [reviewsGiven, reviewsReceived] = await Promise.all([
        // Avis donnés par l'utilisateur
        prisma.review.findMany({
          where: { reviewerId: userId },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewee: {
              select: {
                name: true,
                userType: true
              }
            },
            transaction: {
              select: {
                listing: {
                  select: {
                    book: {
                      select: { title: true }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        
        // Avis reçus par l'utilisateur
        prisma.review.findMany({
          where: { revieweeId: userId },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                name: true,
                userType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);
      
      // Calculer les statistiques
      const avgRating = reviewsReceived.length > 0
        ? reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / reviewsReceived.length
        : 0;
      
      const ratingDistribution = {
        5: reviewsReceived.filter(r => r.rating === 5).length,
        4: reviewsReceived.filter(r => r.rating === 4).length,
        3: reviewsReceived.filter(r => r.rating === 3).length,
        2: reviewsReceived.filter(r => r.rating === 2).length,
        1: reviewsReceived.filter(r => r.rating === 1).length
      };
      
      res.json({
        userId,
        reviewsGiven,
        reviewsReceived,
        statistics: {
          totalGiven: reviewsGiven.length,
          totalReceived: reviewsReceived.length,
          averageRating: parseFloat(avgRating.toFixed(1)),
          ratingDistribution
        }
      });
    } catch (error) {
      console.error('Erreur récupération avis:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   * STATISTIQUES détaillées d'un utilisateur
   * GET /users/:id/stats/detailed
   */
  async getUserDetailedStats(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id);
      // const { id } = req.params;
      // const userId = parseInt(id);
      
      const [
        user,
        activeListings,
        completedSales,
        completedPurchases,
        reviews
      ] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.listing.count({ 
          where: { 
            userId: userId,
            status: 'ACTIVE'
          }
        }),
        prisma.transaction.count({
          where: {
            sellerId: userId,
            status: 'COMPLETED'
          }
        }),
        prisma.transaction.count({
          where: {
            buyerId: userId,
            status: 'COMPLETED'
          }
        }),
        prisma.review.findMany({
          where: { revieweeId: userId },
          select: { rating: true }
        })
      ]);
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 5.0;
      
      const responseTime = '24h'; // À implémenter avec des logs réels
      const completionRate = completedSales > 0 
        ? Math.round((completedSales / (completedSales + 1)) * 100) // Simplifié
        : 100;
      
      res.json({
        userId,
        basicStats: {
          memberSince: user.createdAt,
          totalListings: activeListings,
          totalSales: completedSales,
          totalPurchases: completedPurchases,
          totalTransactions: completedSales + completedPurchases
        },
        performanceStats: {
          averageRating: parseFloat(avgRating.toFixed(1)),
          responseTime,
          completionRate: `${completionRate}%`,
          repeatCustomers: Math.floor(completedSales * 0.3) // Exemple
        },
        activity: {
          lastLogin: new Date().toISOString(), // À implémenter avec auth
          lastTransaction: await this.getLastTransactionDate(userId)
        }
      });
    } catch (error) {
      console.error('Erreur statistiques détaillées:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  private async getLastTransactionDate(userId: number): Promise<string | null> {
    const lastTransaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ],
        status: 'COMPLETED'
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });
    
    return lastTransaction ? lastTransaction.createdAt.toISOString() : null;
  }
}

export default new UserController();