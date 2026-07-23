const express = require('express');
const router = express.Router();
const { getAllJobs, getJob, updateJob, deleteJob } = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getAllJobs);
router.get('/:id', getJob);
router.put('/:id', authenticate, authorize('EMPLOYER'), updateJob);
router.delete('/:id', authenticate, authorize('EMPLOYER'), deleteJob);

module.exports = router;
