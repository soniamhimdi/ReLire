//import { Request, Response } from 'express';
//import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import prisma  from '../prisma/prisma.js';       

//const prisma = new PrismaClient();

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          userType: true,
          location: true,
          rating: true,
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
          email: true,
          name: true,
          userType: true,
          location: true,
          rating: true,
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
      const { email, name, userType, location } = req.body;
      
      if (!email || !name || !userType) {
        return res.status(400).json({ error: 'Email, nom et type requis' });
      }
      
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email déjà utilisé' });
      }
      
      const user = await prisma.user.create({
        data: { email, name, userType, location },
        select: {
          id: true,
          email: true,
          name: true,
          userType: true,
          location: true,
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
          email: true,
          name: true,
          userType: true,
          location: true,
          rating: true
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
}

export default new UserController();