import type { Request, Response } from 'express';
//import { PrismaClient } from '@prisma/client';
import prisma  from '../prisma/prisma';  

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
}

export default new BookController();