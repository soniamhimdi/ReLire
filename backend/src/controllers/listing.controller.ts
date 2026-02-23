import type { Request, Response } from 'express';
import prisma from '../prisma/prisma.js';
import { getUserId, type ClerkRequest } from '../middleware/clerk.middleware.js';
export class ListingController {
  
  async getAllListings(req: Request, res: Response) {
    try {
      const { status, minPrice, maxPrice } = req.query;
      
      const where: any = {};
      if (status) where.status = status;
      
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }
      
      const listings = await prisma.listing.findMany({
        where,
        select: {
          id: true,
          price: true,
          condition: true,
          description: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              userType: true,
              rating: true,
              location: true
            }
          },
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              category: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      res.json(listings);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  async getListingById(req: Request, res: Response) {
    try {
         const listingId = Number(req.params.id);
      // const  id  = req.params;
      // const listingId = parseInt(id);
      
      const listing = await prisma.listing.findUnique({
        // where: { id: listingId },
        where: { id: listingId },
        select: {
          id: true,
          price: true,
          condition: true,
          description: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
              rating: true,
              location: true
            }
          },
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              category: true,
              ageRange: true,
              schoolLevel: true
            }
          },
          transaction: {
            select: {
              id: true,
              status: true,
              buyer: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });
      
      if (!listing) {
        return res.status(404).json({ error: 'Annonce non trouvée' });
      }
      
      res.json(listing);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  async createListing(req: Request, res: Response) {
    try {
      const { userId, bookId, price, condition, description } = req.body;
      
      if (!userId || !bookId || !price || !condition) {
        return res.status(400).json({ error: 'Tous les champs requis' });
      }
      
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      const book = await prisma.book.findUnique({ where: { id: parseInt(bookId) } });
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      
      const listing = await prisma.listing.create({
        data: {
          price: parseFloat(price),
          condition,
          description: description || null,
          userId: parseInt(userId),
          bookId: parseInt(bookId)
        },
        select: {
          id: true,
          price: true,
          condition: true,
          description: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true
            }
          },
          book: {
            select: {
              title: true
            }
          }
        }
      });
      
      res.status(201).json(listing);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  async updateListing(req: Request, res: Response) {
    try {
            const listingId = Number(req.params.id);
    //   const { id } = req.params;
    //   const listingId = parseInt(id);
      const { price, condition, status } = req.body;
      
      const listing = await prisma.listing.update({
        
        where: { id: listingId },
        data: { price, condition, status }
      });
      
      res.json(listing);
    } catch (error: any) {
      console.error('Erreur:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Annonce non trouvée' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  async deleteListing(req: Request, res: Response) {
    try {
            const listingId = Number(req.params.id);
    //   const { id } = req.params;
    //   const listingId = parseInt(id);
      
      await prisma.listing.delete({
        where: { id: listingId } 
        // where: { id }
      });
      
      res.json({ message: 'Annonce supprimée' });
    } catch (error: any) {
      console.error('Erreur:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Annonce non trouvée' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
 
  /**
   * RECHERCHER des annonces avec filtres avancés
   * GET /listings/search?type=EDUCATIONAL&condition=GOOD&location=Montréal
   */
  async searchListingsAdvanced(req: Request, res: Response) {
    try {
      const {
        type,           // Type de livre
        condition,
        minPrice,
        maxPrice,
        location,
        userType,       // Type d'utilisateur vendeur
        minRating,      // Note minimale du vendeur
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = '1',
        limit = '20'
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      
      // Construire les filtres complexes
      const where: any = {
        status: 'ACTIVE'
      };
      
      // Filtre par type de livre
      if (type) {
        where.book = { category: type };
      }
      
      // Filtre par condition
      if (condition) where.condition = condition;
      
      // Filtre par prix
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = parseFloat(minPrice as string);
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
      }
      
      // Filtre par localisation
      if (location) {
        where.user = {
          location: { contains: location, mode: 'insensitive' }
        };
      }
      
      // Filtre par type d'utilisateur vendeur
      if (userType) {
        where.user = { ...where.user, userType };
      }
      
      // Filtre par note minimale du vendeur
      if (minRating) {
        where.user = { 
          ...where.user, 
          rating: { gte: parseFloat(minRating as string) }
        };
      }
      
      // Requête avec relations
      const [listings, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          skip,
          take: limitNum,
          select: {
            id: true,
            price: true,
            condition: true,
            description: true,
            status: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                userType: true,
                rating: true,
                location: true
              }
            },
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                category: true,
                ageRange: true,
                schoolLevel: true
              }
            }
          },
          orderBy: this.getListingOrderBy(sortBy as string, sortOrder as string)
        }),
        prisma.listing.count({ where })
      ]);
      
      // Calculer les statistiques de prix
      const priceStats = await prisma.listing.aggregate({
        where,
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true }
      });
      
      res.json({
        data: listings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        },
        filters: {
          type,
          condition,
          minPrice,
          maxPrice,
          location,
          userType,
          minRating
        },
        statistics: {
          price: {
            average: priceStats._avg.price,
            min: priceStats._min.price,
            max: priceStats._max.price
          }
        }
      });
    } catch (error) {
      console.error('Erreur recherche avancée annonces:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  private getListingOrderBy(sortBy: string, sortOrder: string) {
    const order: any = {};
    const direction = this.getSortOrder(sortOrder);
    
    switch (sortBy) {
      case 'price':
        order.price = direction;
        break;
      case 'rating':
        order.user = { rating: direction };
        break;
      case 'condition':
        order.condition = direction;
        break;
      default: // createdAt par défaut
        order.createdAt = direction;
    }
    
    return order;
  }

  private getSortOrder(sortOrder: string): 'asc' | 'desc' {
    return sortOrder === 'desc' ? 'desc' : 'asc';
  }
  
  /**
   * ANNONCES RECOMMANDÉES pour un utilisateur
   * GET /listings/recommended?userId=1&limit=5
   */
  async getRecommendedListings(req: Request, res: Response) {
    try {
      const { userId, limit = '5' } = req.query;
      const limitNum = parseInt(limit as string);
      
      if (!userId) {
        return res.status(400).json({ error: 'userId requis' });
      }
      
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId as string) },
        select: { userType: true, location: true }
      });
      
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      // Recommandations basées sur le type d'utilisateur
      let recommendedWhere: any = { status: 'ACTIVE' };
      
      switch (user.userType) {
        case 'TEACHER':
          recommendedWhere.book = { 
            OR: [
              { category: 'EDUCATIONAL' },
              { category: 'CHILDREN' },
              { schoolLevel: { not: null } }
            ]
          };
          break;
        case 'PARENT':
          recommendedWhere.book = { 
            OR: [
              { category: 'CHILDREN' },
              { ageRange: { not: null } }
            ]
          };
          break;
        case 'STUDENT':
          recommendedWhere.book = { 
            OR: [
              { category: 'TEXTBOOK' },
              { schoolLevel: 'cegep' }
            ]
          };
          break;
      }
      
      // Prioriser la localisation si disponible
      if (user.location) {
        recommendedWhere.user = {
          location: { contains: user.location.split(',')[0], mode: 'insensitive' }
        };
      }
      
      const recommended = await prisma.listing.findMany({
        where: recommendedWhere,
        take: limitNum,
        select: {
          id: true,
          price: true,
          condition: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              userType: true,
              rating: true,
              location: true
            }
          },
          book: {
            select: {
              title: true,
              author: true,
              category: true,
              ageRange: true
            }
          }
        },
        orderBy: {
          user: { rating: 'desc' }
        }
      });
      
      res.json({
        recommendedFor: `Utilisateur ${user.userType} (${user.location || 'localisation inconnue'})`,
        listings: recommended
      });
    } catch (error) {
      console.error('Erreur recommandations:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   STATISTIQUES des annonces
   * GET /listings/stats
   */
  async getListingsStatistics(req: Request, res: Response) {
    try {
      const [
        totalListings,
        byStatus,
        byCondition,
        priceStats,
        recentActivity,
        booksByCategory
      ] = await Promise.all([
        prisma.listing.count(),
        prisma.listing.groupBy({
          by: ['status'],
          _count: { id: true }
        }),
        prisma.listing.groupBy({
          by: ['condition'],
          _count: { id: true }
        }),
        prisma.listing.aggregate({
          where: { status: 'ACTIVE' },
          _avg: { price: true },
          _min: { price: true },
          _max: { price: true }
        }),
        prisma.listing.findMany({
          where: { status: 'ACTIVE' },
          take: 5,
          select: {
            id: true,
            price: true,
            condition: true,
            createdAt: true,
            book: {
              select: { title: true }
            },
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.book.findMany({
          select: {
            category: true,
            listings: {
              where: { status: 'ACTIVE' },
              select: { id: true }
            }
          }
        })
      ]);

      const categoryCounts = new Map<string, number>();
      for (const book of booksByCategory) {
        const current = categoryCounts.get(book.category) ?? 0;
        categoryCounts.set(book.category, current + book.listings.length);
      }
      const byCategory = Array.from(categoryCounts, ([category, count]) => ({
        category,
        count
      }));
      
      // Nombre d'annonces créées cette semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const listingsThisWeek = await prisma.listing.count({
        where: {
          createdAt: { gte: oneWeekAgo }
        }
      });
      
      res.json({
        overview: {
          total: totalListings,
          active: await prisma.listing.count({ where: { status: 'ACTIVE' } }),
          newThisWeek: listingsThisWeek
        },
        distribution: {
          byStatus,
          byCondition,
          byCategory
        },
        prices: {
          average: priceStats._avg.price,
          min: priceStats._min.price,
          max: priceStats._max.price
        },
        recentActivity
      });
    } catch (error) {
      console.error('Erreur statistiques annonces:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   * CHANGER le statut d'une annonce
   * PATCH /listings/:id/status
   */
  async updateListingStatus(req: ClerkRequest, res: Response) {
    try {
      const listingId = Number(req.params.id);
      // const { id } = req.params;
      // const listingId = parseInt(id);
      const { status } = req.body;
      
      if (!status || !['ACTIVE', 'RESERVED', 'SOLD', 'ARCHIVED'].includes(status)) {
        return res.status(400).json({ 
          error: 'Statut invalide. Valeurs acceptées: ACTIVE, RESERVED, SOLD, ARCHIVED' 
        });
      }
      
      const clerkUserId = getUserId(req);
      if (!clerkUserId) {
        return res.status(401).json({ error: 'Non authentifie' });
      }

      const currentUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId }
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'Utilisateur non trouve' });
      }

      // Vérifier si l'annonce existe
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: {
          user: {
            select: {
              id: true,
              clerkId: true
            }
          },
          transaction: {
            select: {
              id: true,
              buyerId: true,
              sellerId: true
            }
          }
        }
      });
      
      if (!listing) {
        return res.status(404).json({ error: 'Annonce non trouvée' });
      }

      if (status === 'RESERVED') {
        if (listing.userId === currentUser.id) {
          return res.status(403).json({ error: 'Impossible de reserver votre propre annonce' });
        }

        if (listing.status !== 'ACTIVE') {
          return res.status(400).json({ error: 'Annonce deja reservee ou indisponible' });
        }

        if (listing.transaction) {
          return res.status(400).json({ error: 'Transaction deja associee a cette annonce' });
        }

        const [, updatedListing] = await prisma.$transaction([
          prisma.transaction.create({
            data: {
              amount: listing.price,
              status: 'PENDING',
              buyerId: currentUser.id,
              sellerId: listing.userId,
              listingId: listing.id
            }
          }),
          prisma.listing.update({
            where: { id: listingId },
            data: { status },
            include: {
              book: {
                select: { title: true }
              }
            }
          })
        ]);

        return res.json({
          message: 'Annonce reservee',
          listing: updatedListing
        });
      }

      if (status === 'ACTIVE' && listing.status === 'RESERVED') {
        const canCancel =
          currentUser.id === listing.userId ||
          (listing.transaction && listing.transaction.buyerId === currentUser.id);

        if (!canCancel) {
          return res.status(403).json({ error: 'Annulation non autorisee' });
        }

        let updatedListing;

        if (listing.transaction) {
          [, updatedListing] = await prisma.$transaction([
            prisma.transaction.delete({ where: { id: listing.transaction.id } }),
            prisma.listing.update({
              where: { id: listingId },
              data: { status: 'ACTIVE' },
              include: {
                book: {
                  select: { title: true }
                }
              }
            })
          ]);
        } else {
          updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: { status: 'ACTIVE' },
            include: {
              book: {
                select: { title: true }
              }
            }
          });
        }

        return res.json({
          message: 'Reservation annulee',
          listing: updatedListing
        });
      }
      
      // Vérifier les contraintes selon le nouveau statut
      if (status === 'SOLD' && listing.transaction) {
        return res.status(400).json({ 
          error: 'Impossible de marquer comme vendu sans transaction associée' 
        });
      }
      
      const updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: { status },
        include: {
          book: {
            select: { title: true }
          }
        }
      });
      
      res.json({
        message: `Annonce marquée comme ${status.toLowerCase()}`,
        listing: updatedListing
      });
    } catch (error) {
      console.error('Erreur changement statut:', error);
      
      if ((error as any).code === 'P2025') {
        return res.status(404).json({ error: 'Annonce non trouvée' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   * ANNONCES D'UN LIVRE SPÉCIFIQUE
   * GET /books/:id/listings
   */
  async getListingsForBook(req: Request, res: Response) {
    try {
      const bookId = Number(req.params.id);
      // const { id } = req.params;
      // const bookId = parseInt(id);
      const { status = 'ACTIVE', sortBy = 'price', sortOrder = 'asc' } = req.query;
      if (Number.isNaN(bookId)) {
        return res.status(400).json({ error: 'ID livre invalide' });
      }
      
      const book = await prisma.book.findUnique({
        where: { id: bookId },
        select: { id: true, title: true, author: true }
      });
      
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      
      const orderDirection = this.getSortOrder(sortOrder as string);
      const listings = await prisma.listing.findMany({
        where: {
          bookId,
          status: status as string
        },
        select: {
          id: true,
          price: true,
          condition: true,
          status: true,
          createdAt: true,
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              category: true,
              ageRange: true,
              schoolLevel: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              userType: true,
              rating: true,
              location: true
            }
          }
        },
        orderBy: sortBy === 'price' ? { price: orderDirection } : { createdAt: 'desc' }
      });
      
      // Statistiques de prix pour ce livre
      const priceStats = await prisma.listing.aggregate({
        where: {
          bookId,
          status: 'ACTIVE'
        },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
        _count: { id: true }
      });
      
      res.json({
        book,
        listings,
        statistics: {
          totalListings: priceStats._count.id,
          averagePrice: priceStats._avg.price,
          priceRange: {
            min: priceStats._min.price,
            max: priceStats._max.price
          }
        }
      });
    } catch (error) {
      console.error('Erreur annonces par livre:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}

export default new ListingController();