import express, { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { validateAdmin, validateToken } from '../middleware/Auth';
import { paginationMiddleware } from '../middleware/pagination';
import { ipWriteLimiter, reportLimiter } from '../middleware/rateLimit';

const router: Router = express.Router();
const reportController = new ReportController();

// Admin routes (report details include reviewer emails)
router.get('/', validateAdmin, paginationMiddleware('date_created'), reportController.getReports.bind(reportController));

// Protected routes
router.post('/', ipWriteLimiter, validateToken, reportLimiter, reportController.createReport.bind(reportController));

export default router;
