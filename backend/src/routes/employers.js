const express = require('express');
const router = express.Router();
const { searchEmployers, getEmployer, updateProfile, createJob, getJobs } = require('../controllers/employerController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', searchEmployers);
router.get('/:id', getEmployer);
router.put('/profile', authenticate, authorize('EMPLOYER'), upload.fields([
  { name: 'logo', maxCount: 1 }
]), updateProfile);
router.post('/jobs', authenticate, authorize('EMPLOYER'), createJob);
router.get('/jobs', authenticate, authorize('EMPLOYER'), getJobs);

module.exports = router;
