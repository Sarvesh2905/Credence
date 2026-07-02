const express = require('express');
const router = express.Router();
const { upload, createProfile, getProfile, updateProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, upload.single('resume'), createProfile);
router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);

module.exports = router;
