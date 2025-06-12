import express from 'express';
import { validateAdmin } from '../../middleware/Auth';
import { AdminController } from '../controllers/adminController';

const router = express.Router();
const adminController = new AdminController();

// Delete a review and resolve its report
router.delete(
  '/reports/:reportId/reviews',
  validateAdmin,
  adminController.deleteReviewAndResolveReport.bind(adminController)
);

// Delete a professor and resolve its report
router.delete(
  '/reports/:reportId/professors',
  validateAdmin,
  adminController.deleteProfessorAndResolveReport.bind(adminController)
);

// Delete a department and resolve its report
router.delete(
  '/reports/:reportId/departments',
  validateAdmin,
  adminController.deleteDepartmentAndResolveReport.bind(adminController)
);

// Delete a course and resolve its report
router.delete(
  '/reports/:reportId/courses',
  validateAdmin,
  adminController.deleteCourseAndResolveReport.bind(adminController)
);

// Ban a user
router.post('/users/:userId/ban', validateAdmin, adminController.banUser.bind(adminController));

// Get banned users
router.get('/users/banned', validateAdmin, adminController.getBannedUsers.bind(adminController));

// Dismiss a report
router.patch('/reports/:reportId/dismiss', validateAdmin, adminController.dismissReport.bind(adminController));

// Unban a user
router.patch('/users/:userId/unban', validateAdmin, adminController.unbanUser.bind(adminController));

export default router;
