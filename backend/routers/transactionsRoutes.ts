import express from 'express';
const router = express.Router();
import { 
  createTransaction, 
  getTransactions, 
  getTransactionSummary, 
  updateTransaction, 
  deleteTransaction, 
  getTransactionsByDepartment, 
  getMonthlySummary, 
  getByDepartment, 
  getMonthlyResume, 
  getSummaryByDepartment, 
  getFinancialSummary 
} from '../controllers/transactionsController';

import verifyToken from '../middleware/verifyToken';
import asyncHandler from '../utils/asyncHandler';

// Criar transação
router.post('/transactions', verifyToken, asyncHandler(createTransaction)); 

// Listar transações do usuário
router.get('/transactions', verifyToken, asyncHandler(getTransactions));

// Resumo financeiro do usuário
router.get('/transactions/summary', verifyToken, asyncHandler(getTransactionSummary));

// Atualizar transação
router.put('/transactions/:id', verifyToken, asyncHandler(updateTransaction));

// Excluir transação
router.delete('/transactions/:id', verifyToken, asyncHandler(deleteTransaction));

// Mostrar transação por departamento
router.get('/transactions/department/:department', verifyToken, asyncHandler(getTransactionsByDepartment));

//Mostrar os graficos 
router.get('/transactions/graph/monthly', verifyToken, asyncHandler(getMonthlySummary))

// Mostrar por departamento
router.get('/transactions/graph/department', verifyToken, asyncHandler(getByDepartment))

router.get('/transactions/graph/resumo', verifyToken, asyncHandler(getMonthlyResume))

router.get('/transactions/summary-by-department', verifyToken, asyncHandler(getSummaryByDepartment))

router.get('/transactions/financial-summary', verifyToken, asyncHandler(getFinancialSummary))


export default router;