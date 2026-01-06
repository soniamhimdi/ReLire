//import {Request, Response } from 'express';
//import { PrismaClient } from '@prisma/client';
//const prisma = new PrismaClient();
import type { Request, Response } from 'express';
import prisma  from '../prisma/prisma.js';  
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
          status: true,
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
            const id = Number(req.params.id);
    //   const { id } = req.params;
    //   const listingId = parseInt(id);
      
      const listing = await prisma.listing.findUnique({
        // where: { id: listingId },
        where: { id },
        select: {
          id: true,
          price: true,
          condition: true,
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
      const { userId, bookId, price, condition } = req.body;
      
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
          userId: parseInt(userId),
          bookId: parseInt(bookId)
        },
        select: {
          id: true,
          price: true,
          condition: true,
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
            const id = Number(req.params.id);
    //   const { id } = req.params;
    //   const listingId = parseInt(id);
      const { price, condition, status } = req.body;
      
      const listing = await prisma.listing.update({
        // where: { id: listingId },
        where: { id },
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
            const id = Number(req.params.id);
    //   const { id } = req.params;
    //   const listingId = parseInt(id);
      
      await prisma.listing.delete({
        // where: { id: listingId } 
        where: { id }
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
}

export default new ListingController();