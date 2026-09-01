import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';

export const requireRole = (...allowedRoles: Array<'artisan' | 'buyer' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: { code: 'UNAUTHORIZED' },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this resource.`,
        error: { code: 'FORBIDDEN' },
      });
      return;
    }

    next();
  };
};
