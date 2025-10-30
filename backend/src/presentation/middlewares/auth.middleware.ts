// backend/src/presentation/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/environment';

export interface AuthRequest extends Request {
  userId?: number;
  username?: string;
  email?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: number;
      username: string;
      email: string;
    };

    // Agregar datos al request
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.email = decoded.email;

    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: 'Invalid or expired token'
    });
    return;
  }
};