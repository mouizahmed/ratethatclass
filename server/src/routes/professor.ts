import express from 'express';
import { ProfessorController } from '../controllers/professorController';

const router = express.Router();
const professorController = new ProfessorController();

router.get('/', professorController.getProfessors.bind(professorController));
router.get(
  '/by-university-id/:universityId',
  professorController.getProfessorsByUniversityId.bind(professorController)
);
router.get('/by-course-id/:courseId', professorController.getProfessorsByCourseId.bind(professorController));

export default router;
