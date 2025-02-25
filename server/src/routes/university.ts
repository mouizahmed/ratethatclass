import express, { Request, Response } from 'express';
import { pool } from '../db/db';
import { RequestedUniversity, University } from 'types';
import {
  getUniversities,
  getUniversityDomains,
  getUniversityByID,
  getUniversityByName,
  requestUniversity,
  getRequestedUniversities,
  upvoteRequestedUniversity,
  updateTotalVotesRequestedUniversity,
} from '../db/queries';
import { validateUUID } from '../helpers';
import { PoolClient } from 'pg';
import crypto from 'crypto';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getUniversities);
    res.json(result.rows as University[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/name/:universityName', async (req: Request, res: Response) => {
  const universityName = req.params.universityName.replace('_', ' ');
  try {
    const result = await pool.query(getUniversityByName, [universityName]);
    if (result.rows.length == 0) {
      res.json({});
    } else {
      res.json(result.rows[0] as University);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/id/:universityID', async (req: Request, res: Response) => {
  const universityID = req.params.universityID;
  try {
    validateUUID(universityID);
    const result = await pool.query(getUniversityByID, [universityID]);
    if (result.rows.length == 0) {
      res.json({});
    } else {
      res.json(result.rows[0] as University);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/domains', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getUniversityDomains);
    const domains = result.rows.map((item) => item.domain);
    res.json(domains as string[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/request-university-list', async (req: Request, res: Response) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      token = crypto.randomBytes(16).toString('hex');
      res.cookie('token', token, {
        maxAge: 60 * 60 * 24 * 365 * 1000,
        httpOnly: true,
      });
    }

    const list = await pool.query(getRequestedUniversities, [token]);

    res.json(list.rows as RequestedUniversity[]);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.put('/vote-university/id/:universityID', async (req: Request, res: Response) => {
  let client: PoolClient;

  try {
    client = await pool.connect();
    await client.query('BEGIN');
    let token = req.cookies.token;
    const universityID = req.params.universityID;
    validateUUID(universityID);

    if (!token) {
      token = crypto.randomBytes(16).toString('hex');
      res.cookie('token', token, {
        maxAge: 60 * 60 * 24 * 365 * 1000,
        httpOnly: true,
      });
    }

    await client.query(upvoteRequestedUniversity, [universityID, token]);
    await client.query(updateTotalVotesRequestedUniversity, [universityID]);

    await client.query('COMMIT');
    res.json({ message: `${universityID} successfully upvoted by user_token ${token}` });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    if (client) {
      client.release();
    } else {
      console.log('Failed to acquire a database client.');
      res.status(500).json({
        error: 'Failed to acquire a database client. Please try again later.',
      });
    }
  }
});

router.post('/request-university', async (req: Request, res: Response) => {
  let client: PoolClient;

  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const { universityName }: { universityName: string } = req.body;
    const universityRequest = await client.query(requestUniversity, [universityName]);

    if (req.cookies.token) {
      await client.query(upvoteRequestedUniversity, [universityRequest.rows[0].university_id, req.cookies.token]);
    } else {
      const token = crypto.randomBytes(16).toString('hex');
      res.cookie('token', token, {
        maxAge: 60 * 60 * 24 * 365 * 1000,
        httpOnly: true,
      });
      await client.query(upvoteRequestedUniversity, [universityRequest.rows[0].university_id, token]);
    }
    await client.query('COMMIT');
    res.json({ message: `${universityName} successfully added to university request list.` });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    if (client) {
      client.release();
    } else {
      res.status(500).json({
        error: 'Failed to acquire a database client. Please try again later.',
      });
    }
  }
});

export default router;
