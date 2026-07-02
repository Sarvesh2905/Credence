const express = require('express');
const router = express.Router();
const {
  startAssessment,
  getAssessment,
  getAssessments,
  submitSection,
  submitAssessment,
} = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/auth');

router.post('/start', authMiddleware, startAssessment);
router.get('/', authMiddleware, getAssessments);
router.get('/:assessmentId', authMiddleware, getAssessment);
router.post('/:assessmentId/submit-section', authMiddleware, submitSection);
router.post('/:assessmentId/submit', authMiddleware, submitAssessment);

module.exports = router;
