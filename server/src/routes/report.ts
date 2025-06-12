import express, { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { validateToken } from '../../middleware/Auth';
import { paginationMiddleware } from '../../middleware/pagination';

const router: Router = express.Router();
const reportController = new ReportController();

// Public routes
router.get('/', paginationMiddleware('date_created'), reportController.getReports.bind(reportController));

// Protected routes
router.post('/', validateToken, reportController.createReport.bind(reportController));

export default router;
