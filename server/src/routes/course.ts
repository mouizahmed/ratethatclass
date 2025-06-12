import express from 'express';
import { CourseController } from '../controllers/courseController';
import { CourseService } from '../services/courseService';
import { CourseRepository } from '../repositories/courseRepository';
import { validateToken } from '../../middleware/Auth';

const router = express.Router();

// Initialize dependencies
const courseRepository = new CourseRepository();
const courseService = new CourseService(courseRepository);
const courseController = new CourseController(courseService);

// Routes
router.get('/', courseController.getCourses.bind(courseController));
router.get('/by-university-id/:universityId', courseController.getCoursesByUniversityId.bind(courseController));
router.get('/by-department-id/:departmentId', courseController.getCoursesByDepartmentId.bind(courseController));
router.get('/by-id/:id', courseController.getCourseById.bind(courseController));
router.get('/by-university-id/:universityId/by-tag/:courseTag', courseController.getCourseByTag.bind(courseController));
router.post('/', validateToken, courseController.addCourseWithReview.bind(courseController));

export default router;
