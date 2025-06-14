import express from 'express';
import { ProfessorController } from '../controllers/professorController';
import { paginationMiddleware } from '../middleware/pagination';

const router = express.Router();
const professorController = new ProfessorController();

router.get(
  '/',
  paginationMiddleware('professor_name', 'asc'),
  professorController.getProfessors.bind(professorController)
);
router.get(
  '/by-university-id/:universityId',
  paginationMiddleware('professor_name', 'asc'),
  professorController.getProfessorsByUniversityId.bind(professorController)
);
router.get('/by-course-id/:courseId', professorController.getProfessorsByCourseId.bind(professorController));

export default router;
