import express from 'express';
import { UniversityController } from '../controllers/universityController';
import { UniversityService } from '../services/universityService';
import { UniversityRepository } from '../repositories/universityRepository';

const router = express.Router();

const universityRepository = new UniversityRepository();
const universityService = new UniversityService(universityRepository);
const universityController = new UniversityController(universityService);

router.get('/', universityController.getUniversities.bind(universityController));
router.get('/by-name/:name', universityController.getUniversityByName.bind(universityController));
router.get('/by-id/:id', universityController.getUniversityById.bind(universityController));
router.get('/domains', universityController.getUniversityDomains.bind(universityController));
router.get('/requests', universityController.getRequestedUniversities.bind(universityController));
router.put('/requests/:id/vote', universityController.upvoteRequestedUniversity.bind(universityController));
router.post('/requests', universityController.requestUniversity.bind(universityController));

export default router;
