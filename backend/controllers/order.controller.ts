import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.ts';
import { getUserOrders } from '../services/db.ts';

export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      return res.status(401).json({ message: 'Unauthorized: User identity missing' });
    }

    const orders = await getUserOrders(uid);
    res.json(orders);
  } catch (error) {
    console.error('[Order Controller] Fetch Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
