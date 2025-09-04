import prisma from '../config/prisma';

import { Request, Response } from 'express';

// Listar departamentos do usuário
const getDepartments = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = Number(req.user.id);
  try {
    const departments = await prisma.department.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(departments);
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar departamentos' });
  }
};

// Criar novo departamento
const createDepartment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = Number(req.user.id);
  const { name } = req.body;
  try {
    const newDepartment = await prisma.department.create({
      data: {
        name,
        user_id: userId,
      },
    });
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error('Erro ao criar departamento:', error);
    res.status(500).json({ error: 'Erro ao criar departamento' });
  }
};

export { getDepartments, createDepartment };
