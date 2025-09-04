import jwt, { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';

import { Request, Response, NextFunction, RequestHandler } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const verifyToken: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Verifica se existe um token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
        const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não está definido');
    }
    const decoded = jwt.verify(token, jwtSecret);
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
      req.user = { id: decoded.id as string }; // salva o id do usuário para uso nas próximas rotas
    } else {
      res.status(403).json({ error: 'Token inválido ou expirado' });
      return;
    }
    next(); // segue para o próximo passo (ex: controller)
  } catch (error) {
    res.status(403).json({ error: 'Token inválido ou expirado' });
    return;
  }
};

export default verifyToken;
