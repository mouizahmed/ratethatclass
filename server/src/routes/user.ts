import express, { Response } from 'express';
import { addUser, getUserReviews, getUserVotedReviews } from '../db/queries';
import { pool } from '../db/db';
import { AuthenticatedRequest, Review, VoteItem } from 'types';
import { validateToken } from '../../middleware/Auth';
import { auth } from '../../firebase/firebase';

const router = express.Router();

router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  35;

  const { display_name, email, password } = req.body;

  try {
    const newUser = await auth.createUser({
      email: email.trim(),
      emailVerified: false,
      password: password,
      displayName: display_name.trim(),
    });
    await pool.query(addUser, [newUser.uid, display_name.trim(), email.trim()]);
    const token = await auth.createCustomToken(newUser.uid);
    res.json({ token: token });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/reviews', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { uid } = req.user;

  try {
    const result = await pool.query(getUserReviews, [uid]);
    res.json(result.rows as Review[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/upvotes', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { uid } = req.user;

  try {
    const result = await pool.query(getUserVotedReviews, [uid, 'up']);

    res.json(result.rows as Review[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/downvotes', validateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { uid } = req.user;

  try {
    const result = await pool.query(getUserVotedReviews, [uid, 'down']);
    res.json(result.rows as Review[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.delete('/delete/reviewID/:review_id', validateToken, async (req: AuthenticatedRequest, res: Response) => {});

export default router;
