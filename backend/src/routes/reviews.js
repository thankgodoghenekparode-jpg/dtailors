const express = require('express');
const router = express.Router();
const { createReview, getReviews } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createReview);
router.get('/:reviewedId', getReviews);

module.exports = router;
