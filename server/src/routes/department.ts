import express from 'express';
import { DepartmentController } from '../controllers/departmentController';
import { paginationMiddleware } from '../../middleware/pagination';

const router = express.Router();
const departmentController = new DepartmentController();

router.get('/', paginationMiddleware('total_reviews'), departmentController.getDepartments.bind(departmentController));
router.get(
  '/by-university-id/:universityId',
  departmentController.getDepartmentsByUniversityId.bind(departmentController)
);
router.get('/by-id/:id', departmentController.getDepartmentById.bind(departmentController));
router.post('/', departmentController.addDepartment.bind(departmentController));

export default router;
