import express, { Request, Response } from 'express';
import { pool } from '../db/db';
import { RequestedUniversity, University } from 'types';
import {
  getUniversities,
  getUniversitiesPaginated,
  getUniversitiesCount,
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
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;
  const search = (req.query.search as string) || null;
  const sortBy = (req.query.sort_by as string) || 'review_num';
  const sortOrder = (req.query.sort_order as string) || 'desc';

  try {
    const result = await pool.query(getUniversitiesPaginated, [limit, offset, search, sortBy, sortOrder]);
    const countResult = await pool.query(getUniversitiesCount, [search]);

    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      message: 'Universities fetched successfully',
      data: result.rows as University[],
      meta: {
        current_page: page,
        page_size: limit,
        total_items: totalItems,
        total_pages: totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

router.get('/name/:universityName', async (req: Request, res: Response) => {
  const universityName = req.params.universityName.replace('_', ' ');
  try {
    const result = await pool.query(getUniversityByName, [universityName]);
    if (result.rows.length == 0) {
      res.json({
        success: false,
        message: 'University not found',
        data: {},
        meta: {},
      });
    } else {
      res.json({
        success: true,
        message: 'University fetched successfully',
        data: result.rows[0] as University,
        meta: {},
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

router.get('/id/:universityID', async (req: Request, res: Response) => {
  const universityID = req.params.universityID;
  try {
    validateUUID(universityID);
    const result = await pool.query(getUniversityByID, [universityID]);
    if (result.rows.length == 0) {
      res.json({
        success: false,
        message: 'University not found',
        data: {},
        meta: {},
      });
    } else {
      res.json({
        success: true,
        message: 'University fetched successfully',
        data: result.rows[0] as University,
        meta: {},
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  }
});

router.get('/domains', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(getUniversityDomains);
    const domains = result.rows.map((item) => item.domain);
    res.json({
      success: true,
      message: 'University domains fetched successfully',
      data: domains as string[],
      meta: {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
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

    res.json({
      success: true,
      message: 'Requested universities fetched successfully',
      data: list.rows as RequestedUniversity[],
      meta: {},
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
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
    res.json({
      success: true,
      message: `University successfully upvoted`,
      data: { university_id: universityID, user_token: token },
      meta: {},
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  } finally {
    if (client) {
      client.release();
    } else {
      console.log('Failed to acquire a database client.');
      res.status(500).json({
        success: false,
        message: 'Failed to acquire a database client',
        data: {},
        meta: {},
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
    const universityRequest = await client.query(requestUniversity, [universityName.trim()]);

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
    res.json({
      success: true,
      message: `University request successfully added`,
      data: { university_name: universityName },
      meta: {},
    });
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      meta: {},
    });
  } finally {
    if (client) {
      client.release();
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to acquire a database client',
        data: {},
        meta: {},
      });
    }
  }
});

export default router;
