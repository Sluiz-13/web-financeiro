import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

const getAllSavings = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = Number(req.user.id);
  const savings = await prisma.saving.findMany({
    where: { user_id: userId },
    orderBy: { date: 'desc' },
  });
  res.json(savings);
};

const createSaving = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = Number(req.user.id);
  const { amount, description, date } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Valor inválido.' });
  }

  const newSaving = await prisma.saving.create({
    data: {
      user_id: userId,
      amount,
      description: description || null,
      date: date ? new Date(date) : new Date(),
    },
  });

  res.status(201).json(newSaving);
};

const getSavingsSummary = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = Number(req.user.id);

  const result = await prisma.$queryRaw`
    SELECT
      TO_CHAR(date, 'YYYY-MM') AS month,
      SUM(amount) AS total
    FROM "Saving"
    WHERE user_id = ${userId}
    GROUP BY month
    ORDER BY month ASC
  `;

  res.json(result);
};

const deleteSaving = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = Number(req.user.id);
  const { id } = req.params;

  try {
    await prisma.saving.delete({
      where: { id: Number(id), user_id: userId },
    });
    res.status(200).json({ message: 'Economia deletada com sucesso.' });
  } catch (error) {
    res.status(404).json({ message: 'Economia não encontrada.' });
  }
};

const updateSaving = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = Number(req.user.id);
  const { id } = req.params;
  const { amount, description, date } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ message: 'Valor inválido.' });
  }

  try {
    const updatedSaving = await prisma.saving.update({
      where: { id: Number(id), user_id: userId },
      data: {
        amount,
        description: description || null,
        date: date ? new Date(date) : new Date(),
      },
    });
    res.status(200).json(updatedSaving);
  } catch (error) {
    res.status(404).json({ message: 'Economia não encontrada.' });
  }
};

export { getAllSavings, createSaving, getSavingsSummary, deleteSaving, updateSaving };

