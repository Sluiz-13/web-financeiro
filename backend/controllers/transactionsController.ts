import prisma from '../config/prisma';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

const createTransaction = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  const { title, amount, type, date, department } = req.body;
  const userId = Number(req.user.id);

  if (!title || !amount || !type || !date) {
    return res.status(400).json({ error: "Campos obrigatórios: title, amount, type e date" });
  }

  const parsedAmount = parseFloat(amount);

  if (isNaN(parsedAmount)) {
    return res.status(400).json({ error: "O valor da transação (amount) deve ser um número válido." });
  }

  try {
    if (department) {
      const departmentExists = await isValidDepartment(department, userId);
      if (!departmentExists) {
        await prisma.department.create({
          data: { name: department, user_id: userId },
        });
      }
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        title,
        amount: parsedAmount,
        type,
        date: new Date(date),
        department: department || null,
        user_id: userId,
      },
    });
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Erro ao criar transação", error);
    res.status(500).json({ error: "Erro interno ao criar transação" });
  }
};

const getTransactions = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const userId = Number(req.user.id);

  try {
    const { month, year, type, department } = req.query;

    const where: Prisma.TransactionWhereInput = { user_id: userId };

    if (type) {
      where.type = type as string;
    }
    if (department) {
      where.department = department as string;
    }
    if (month && year) {
        where.date = {
            gte: new Date(Number(year), Number(month) - 1, 1),
            lt: new Date(Number(year), Number(month), 1),
        };
    } else if (year) {
        where.date = {
            gte: new Date(Number(year), 0, 1),
            lt: new Date(Number(year) + 1, 0, 1),
        };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json(transactions);

  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro interno ao buscar transações' });
  }
}

const getTransactionSummary = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    const userId = Number(req.user.id);
  
    try {
        const totals = await prisma.transaction.groupBy({
            by: ['type'],
            where: { user_id: userId },
            _sum: {
              amount: true,
            },
          });
      
          const previsoes = await prisma.transaction.count({
            where: {
              user_id: userId,
              expected: true,
            },
          });

      const total_entradas = totals.find(t => t.type === 'entrada')?._sum.amount?.toNumber() || 0;
      const total_saidas = totals.find(t => t.type === 'saida')?._sum.amount?.toNumber() || 0;
  
      res.status(200).json({
        total_entradas,
        total_saidas,
        saldo: total_entradas - total_saidas,
        previsoes,
      });
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      res.status(500).json({ error: 'Erro interno ao gerar resumo' });
    }
  };

const updateTransaction = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const { id } = req.params;
  const userId = Number(req.user.id);
  const { title, amount, type, department, expected, date } = req.body;

  try {
    const updatedTransaction = await prisma.transaction.update({
      where: { id: Number(id), user_id: userId },
      data: {
        title,
        amount,
        type,
        department,
        expected,
        date: new Date(date),
      },
    });
    res.status(200).json(updatedTransaction);
  } catch (error: any) {
    console.error('Erro detalhado ao atualizar transação:', error);
    if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário.' });
    }
    res.status(500).json({ 
      error: 'Erro interno ao atualizar a transação.', 
      details: error.message, 
      code: error.code 
    });
  }
};

const deleteTransaction = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  const { id } = req.params;
  const userId = Number(req.user.id);

  try {
    await prisma.transaction.delete({
      where: { id: Number(id), user_id: userId },
    });
    res.status(200).json({ message: 'Transação excluída com sucesso' });
  } catch (error) {
    res.status(404).json({ error: 'Transação não encontrada' });
  }
};

const getTransactionsByDepartment = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    const { department } = req.params;
    const userId = Number(req.user.id);
  
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          department: { equals: department, mode: 'insensitive' },
        },
        orderBy: { created_at: 'desc' },
      });
  
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Erro ao buscar transações por departamento:', error);
      res.status(500).json({ error: 'Erro interno ao buscar transações' });
    }
  };

  interface MonthlySummaryResult {
    [key: number]: { entrada: number; saida: number };
  }
  
  const getMonthlySummary = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    try {
      const userId = Number(req.user.id);
  
      const query = Prisma.sql`
        SELECT 
          EXTRACT(MONTH FROM date) AS month,
          type,
          SUM(amount) AS total
        FROM "Transaction"
        WHERE user_id = ${userId} AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY month, type
        ORDER BY month
      `;
      const rows: { month: number; type: 'entrada' | 'saida'; total: number }[] = await prisma.$queryRaw(query);
  
      const result: MonthlySummaryResult = {};
  
      for (let i = 1; i <= 12; i++) {
        result[i] = { entrada: 0, saida: 0 };
      }
  
      rows.forEach((row) => {
        const m = row.month;
        result[m][row.type] = Number(row.total);
      });
  
      res.json(result);
  
    } catch (error) {
      console.error('Erro ao buscar gráfico mensal:', error);
      res.status(500).json({ error: 'Erro ao gerar gráfico mensal' });
    }
  }

  const getByDepartment = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    try {
      const userId = Number(req.user.id);
      const { month, year } = req.query;
  
      if (!month || !year) {
        res.status(400).json({ error: 'Informe mês e ano' });
        return;
      }
  
      const query = Prisma.sql`
        SELECT department, SUM(amount) AS total
        FROM "Transaction"
        WHERE user_id = ${userId}
          AND type = 'saida'
          AND EXTRACT(MONTH FROM date) = ${Number(month)}
          AND EXTRACT(YEAR FROM date) = ${Number(year)}
        GROUP BY department
        ORDER BY total DESC
      `;
  
      const rows = await prisma.$queryRaw(query);
      res.json(rows);
  
    } catch (error) {
      console.error('Erro ao buscar por departamento:', error);
      res.status(500).json({ error: 'Erro ao gerar gráfico por departamento' });
    }
  }

  interface MonthlyResumeResult {
    entrada: number;
    saida: number;
  }
  
  const getMonthlyResume = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    try {
      const userId = Number(req.user.id);
      const { month, year } = req.query;
  
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
  
      const m = (month as string) || currentMonth;
      const y = (year as string) || currentYear;
  
      const query = Prisma.sql`
        SELECT type, SUM(amount) AS total
        FROM "Transaction"
        WHERE user_id = ${userId}
          AND EXTRACT(MONTH FROM date) = ${Number(m)}
          AND EXTRACT(YEAR FROM date) = ${Number(y)}
        GROUP BY type
      `;
  
      const rows: { type: 'entrada' | 'saida'; total: number }[] = await prisma.$queryRaw(query);
  
      const result: MonthlyResumeResult = { entrada: 0, saida: 0 };
  
      rows.forEach((row) => {
        result[row.type] = Number(row.total);
      });
  
      res.json(result);
  
    } catch (error) {
      console.error('Erro ao gerar resumo mensal:', error);
      res.status(500).json({ error: 'Erro ao gerar resumo do mês' });
    }
  }

  const isValidDepartment = async (departmentName: string, userId: number) => {
    const department = await prisma.department.findFirst({
      where: {
        name: departmentName,
        OR: [
          { user_id: userId },
          { is_default: true },
        ],
      },
    });
    return !!department;
  }

  const getSummaryByDepartment = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    const userId = Number(req.user.id);
  
    try {
      const query = Prisma.sql`
        SELECT department, type, SUM(amount) AS total
        FROM "Transaction"
        WHERE user_id = ${userId}
        GROUP BY department, type
        ORDER BY department
      `;
      const rows = await prisma.$queryRaw(query);
      res.json(rows);
    } catch (error) {
      console.error('Erro ao gerar resumo por departamento:', error);
      res.status(500).json({ error: 'Erro ao gerar resumo por departamento' });
    }
  }

  const getFinancialSummary = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }
    const userId = Number(req.user.id);
  
    try {
      const query = Prisma.sql`
        SELECT
          SUM(CASE WHEN type = 'entrada' THEN amount ELSE 0 END) AS total_entrada,
          SUM(CASE WHEN type = 'saida' THEN amount ELSE 0 END) AS total_saida
        FROM "Transaction"
        WHERE user_id = ${userId}
      `;
      const rows: { total_entrada: number; total_saida: number }[] = await prisma.$queryRaw(query);
      const { total_entrada, total_saida } = rows[0];
  
      const saldo = (Number(total_entrada || 0) - Number(total_saida || 0)).toFixed(2);
  
      res.json({
        total_entrada: Number(total_entrada || 0),
        total_saida: Number(total_saida || 0),
        saldo: parseFloat(saldo)
      });
    } catch (error) {
      console.error('Erro ao obter resumo financeiro:', error);
      res.status(500).json({ error: 'Erro ao obter resumo financeiro' });
    }
  }

export {
  createTransaction,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
  deleteTransaction,
  getTransactionsByDepartment,
  getMonthlySummary,
  getByDepartment,
  getMonthlyResume,
  isValidDepartment,
  getSummaryByDepartment,
  getFinancialSummary
};