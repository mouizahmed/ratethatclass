import express, { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { validateToken } from '../../middleware/Auth';

const router: Router = express.Router();
const reportController = new ReportController();

// Public routes
router.get('/', reportController.getReports.bind(reportController));

// Protected routes
router.post('/', validateToken, reportController.createReport.bind(reportController));

export default router;
