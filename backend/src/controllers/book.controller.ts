import type { Request, Response } from 'express';
//import { PrismaClient } from '@prisma/client';
import prisma from '../prisma/prisma.js';

//const prisma = new PrismaClient();

export class BookController {
  async getAllBooks(req: Request, res: Response) {
    try {
      const { category, ageRange } = req.query;
      
      const where: any = {};
      if (category) where.category = category;
      if (ageRange) where.ageRange = ageRange;
      
      const books = await prisma.book.findMany({
        where,
        select: {
          id: true,
          title: true,
          author: true,
          category: true,
          ageRange: true,
          schoolLevel: true,
          language: true,
          _count: {
            select: {
              listings: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        }
      });
      
      res.json(books);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  async getBookById(req: Request, res: Response) {
    try {
            const id = Number(req.params.id);
    //   const { id } = req.params;
    //   const bookId = parseInt(id);
      
      const book = await prisma.book.findUnique({
        // where: { id: bookId },
        where: { id },
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
          category: true,
          ageRange: true,
          schoolLevel: true,
          language: true,
          listings: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              price: true,
              condition: true,
              user: {
                select: {
                  name: true,
                  userType: true,
                  rating: true,
                  location: true
                }
              }
            }
          }
        }
      });
      
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      
      res.json(book);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  async createBook(req: Request, res: Response) {
    try {
      const { title, author, isbn, category, ageRange, schoolLevel } = req.body;
      
      if (!title || !author || !category) {
        return res.status(400).json({ error: 'Titre, auteur et catégorie requis' });
      }
      
      const book = await prisma.book.create({
        data: {
          title,
          author,
          isbn,
          category,
          ageRange,
          schoolLevel
        }
      });
      
      res.status(201).json(book);
    } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }


  /**
   * SUPPRIMER un livre
   * DELETE /books/:id
   */
  async deleteBook(req: Request, res: Response) {
    try {
       const id = Number(req.params.id);
      // const { id } = req.params;
      // const bookId = parseInt(id);
      
      // Vérifier si le livre existe et a des annonces actives
      const book = await prisma.book.findUnique({
        // where: { id: bookid },
        where: { id },
        include: {
          listings: {
            where: { status: 'ACTIVE' }
          }
        }
      });
      
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      
      if (book.listings.length > 0) {
        return res.status(400).json({ 
          error: 'Impossible de supprimer, annonces actives existantes',
          activeListings: book.listings.length
        });
      }
      
      await prisma.book.delete({
          where: { id }
        // where: { id: bookId }
      });
      
      res.json({ 
        message: 'Livre supprimé avec succès',
        bookId: id 
      });
    } catch (error) {
      console.error('Erreur suppression livre:', error);
      
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   * RECHERCHER des livres par type/catégorie avec filtres avancés
   * GET /books/search?category=EDUCATIONAL&schoolLevel=primaire&minListings=1
   */
  async searchBooksAdvanced(req: Request, res: Response) {
    try {
      const { 
        category, 
        schoolLevel, 
        ageRange,
        language,
        minListings = '0',
        maxListings,
        sortBy = 'title',
        sortOrder = 'asc',
        page = '1',
        limit = '20'
      } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      
      // Construire les filtres
      const where: any = {};
      
      if (category) where.category = category;
      if (schoolLevel) where.schoolLevel = schoolLevel;
      if (ageRange) where.ageRange = ageRange;
      if (language) where.language = language;
      
      // Requête avec comptage d'annonces
      const books = await prisma.book.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          title: true,
          author: true,
          isbn: true,
          category: true,
          ageRange: true,
          schoolLevel: true,
          language: true,
          _count: {
            select: {
              listings: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        },
        orderBy: this.getOrderBy(sortBy as string, sortOrder as string)
      });
      
      // Filtrer par nombre d'annonces si spécifié
      let filteredBooks = books;
      const minListingsNum = parseInt(minListings as string);
      
      if (minListingsNum > 0) {
        filteredBooks = books.filter(book => book._count.listings >= minListingsNum);
      }
      
      if (maxListings) {
        const maxListingsNum = parseInt(maxListings as string);
        filteredBooks = filteredBooks.filter(book => book._count.listings <= maxListingsNum);
      }
      
      // Pagination manuelle après filtrage
      const total = filteredBooks.length;
      const paginatedBooks = filteredBooks.slice(skip, skip + limitNum);
      
      // Statistiques par catégorie
      const categoryStats = await prisma.book.groupBy({
        by: ['category'],
        where,
        _count: { id: true }
      });
      
      res.json({
        data: paginatedBooks.map(book => ({
          ...book,
          availableListings: book._count.listings
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        },
        filters: {
          category,
          schoolLevel,
          ageRange,
          language,
          minListings: minListingsNum
        },
        statistics: {
          byCategory: categoryStats
        }
      });
    } catch (error) {
      console.error('Erreur recherche avancée livres:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  private getOrderBy(sortBy: string, sortOrder: string) {
    const order: any = {};
    
    if (sortBy === 'listings') {
      order.listings = { _count: sortOrder };
    } else if (sortBy === 'title' || sortBy === 'author' || sortBy === 'category') {
      order[sortBy] = sortOrder;
    } else {
      order.title = 'asc'; // Par défaut
    }
    
    return order;
  }
  
  /**
   * LIVRES POPULAIRES (plus d'annonces)
   * GET /books/popular?limit=10
   */
  async getPopularBooks(req: Request, res: Response) {
    try {
      const { limit = '10', category } = req.query;
      const limitNum = parseInt(limit as string);
      
      const where: any = {};
      if (category) where.category = category;
      
      // Trouver les livres avec le plus d'annonces actives
      const books = await prisma.book.findMany({
        where,
        take: limitNum,
        select: {
          id: true,
          title: true,
          author: true,
          category: true,
          ageRange: true,
          _count: {
            select: {
              listings: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        },
        orderBy: {
          listings: {
            _count: 'desc'
          }
        }
      });
      
      res.json({
        popularBooks: books.map(book => ({
          ...book,
          listingCount: book._count.listings
        })),
        basedOn: 'Nombre d\'annonces actives'
      });
    } catch (error) {
      console.error('Erreur livres populaires:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   * STATISTIQUES des livres
   * GET /books/stats/overview
   */
  async getBooksStatistics(req: Request, res: Response) {
    try {
      const [
        totalBooks,
        byCategory,
        bySchoolLevel,
        byLanguage,
        mostListedBook
      ] = await Promise.all([
        prisma.book.count(),
        prisma.book.groupBy({
          by: ['category'],
          _count: { id: true }
        }),
        prisma.book.groupBy({
          by: ['schoolLevel'],
          where: { schoolLevel: { not: null } },
          _count: { id: true }
        }),
        prisma.book.groupBy({
          by: ['language'],
          _count: { id: true }
        }),
        prisma.book.findFirst({
          select: {
            id: true,
            title: true,
            author: true,
            _count: {
              select: {
                listings: true
              }
            }
          },
          orderBy: {
            listings: {
              _count: 'desc'
            }
          }
        })
      ]);
      
      res.json({
        overview: {
          totalBooks,
          booksWithISBN: await prisma.book.count({ where: { isbn: { not: null } } }),
          booksWithAgeRange: await prisma.book.count({ where: { ageRange: { not: null } } })
        },
        distribution: {
          byCategory,
          bySchoolLevel,
          byLanguage
        },
        mostPopular: mostListedBook ? {
          title: mostListedBook.title,
          author: mostListedBook.author,
          totalListings: mostListedBook._count.listings
        } : null
      });
    } catch (error) {
      console.error('Erreur statistiques livres:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  /**
   * RÉPARTITION des livres par état (basé sur les annonces actives)
   * GET /books/stats/condition
   */
  async getBooksConditionStats(req: Request, res: Response) {
    try {
      const { category } = req.query;

      const where: any = { status: 'ACTIVE' };
      if (category) {
        where.book = { category };
      }

      const [totalActive, byCondition] = await Promise.all([
        prisma.listing.count({ where }),
        prisma.listing.groupBy({
          by: ['condition'],
          where,
          _count: { id: true }
        })
      ]);

      res.json({
        totalActive,
        byCondition: byCondition.map(item => ({
          condition: item.condition,
          count: item._count.id
        }))
      });
    } catch (error) {
      console.error('Erreur stats condition livres:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
  
  /**
   * METTRE À JOUR un livre
   * PUT /books/:id
   */
  async updateBook(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      // const { id } = req.params;
      // const bookId = parseInt(id);
      const { title, author, isbn, category, ageRange, schoolLevel, language } = req.body;
      
      // Vérifier si le livre existe
      const existingBook = await prisma.book.findUnique({
        where: { id }
      });
      
      if (!existingBook) {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      
      // Vérifier si ISBN est unique (s'il est fourni)
      if (isbn && isbn !== existingBook.isbn) {
        const bookWithSameIsbn = await prisma.book.findUnique({
          where: { isbn }
        });
        
        if (bookWithSameIsbn) {
          return res.status(409).json({ 
            error: 'ISBN déjà utilisé',
            existingBook: bookWithSameIsbn
          });
        }
      }
      
      const updatedBook = await prisma.book.update({
        where: { id },
        data: {
          title: title || existingBook.title,
          author: author || existingBook.author,
          isbn: isbn !== undefined ? isbn : existingBook.isbn,
          category: category || existingBook.category,
          ageRange: ageRange !== undefined ? ageRange : existingBook.ageRange,
          schoolLevel: schoolLevel !== undefined ? schoolLevel : existingBook.schoolLevel,
          language: language || existingBook.language
        }
      });
      
      res.json({
        message: 'Livre mis à jour avec succès',
        book: updatedBook
      });
    } catch (error) {
      console.error('Erreur mise à jour livre:', error);
      
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return res.status(404).json({ error: 'Livre non trouvé' });
      }
      
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
}


export default new BookController();