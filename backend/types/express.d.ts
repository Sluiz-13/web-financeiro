import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Ou o tipo específico do seu objeto de usuário
    }
  }
}