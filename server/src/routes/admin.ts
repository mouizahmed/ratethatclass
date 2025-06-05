import express, { Response } from 'express';
import { validateToken } from '../../middleware/Auth';
import { AuthenticatedRequest } from 'types';
import { pool } from '../db/db';

const router = express.Router();

// Example admin route
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json({
      success: true,
      message: 'Users fetched successfully',
      data: result.rows,
      meta: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

export default router;
