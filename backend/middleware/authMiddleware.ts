
import type { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase.ts';

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role: string;
  };
}

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Verify Token with Firebase Auth
    const decodedToken = await auth.verifyIdToken(token);
    
    // 2. Check Database for Role (Double Security)
    // We don't trust the token claim alone for high-stakes admin actions, we check the live DB
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({ message: 'Forbidden: User not found' });
    }

    const userData = userDoc.data();
    
    if (userData?.role !== 'admin') {
      console.warn(`[Security] Non-admin ${decodedToken.email} attempted to access admin route.`);
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }

    // Attach user to request for downstream controllers
    (req as AuthRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware] Verification Failed:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
