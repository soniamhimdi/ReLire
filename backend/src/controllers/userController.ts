// controllers/userController.ts
import type { Request, Response } from 'express';
import prisma from '../utils/prisma';

interface UserParams {
  id: string;
}

interface CreateUserBody {
  email: string;
  password: string;
  name?: string;
}

// GET - Récupérer tous les utilisateurs
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Récupérer un utilisateur par ID
export const getUserById = async (
  req: Request<UserParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id }
    });
    if (!user) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST - Créer un utilisateur
export const createUser = async (
  req: Request<{}, {}, CreateUserBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password, name } = req.body;
    const newUser = await prisma.user.create({
      data: { email, password, name }
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

// DELETE - Supprimer un utilisateur
export const deleteUser = async (
  req: Request<UserParams>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};