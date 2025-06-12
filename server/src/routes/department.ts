import express from 'express';
import { DepartmentController } from '../controllers/departmentController';

const router = express.Router();
const departmentController = new DepartmentController();

router.get('/', departmentController.getDepartments.bind(departmentController));
router.get(
  '/by-university-id/:universityId',
  departmentController.getDepartmentsByUniversityId.bind(departmentController)
);
router.get('/by-id/:id', departmentController.getDepartmentById.bind(departmentController));
router.post('/', departmentController.addDepartment.bind(departmentController));

export default router;
