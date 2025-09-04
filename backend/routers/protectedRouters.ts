import express, { Request, Response } from 'express';
const router = express.Router();
import verifyToken from '../middleware/verifyToken';
import asyncHandler from '../utils/asyncHandler';

router.get('/profile', verifyToken, (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Usuário não autenticado.' });
    return;
  }
  res.json({
    message: 'Acesso autorizado',
    userId: req.user.id, // veio do token
  });
});

export default router;
