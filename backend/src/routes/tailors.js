const express = require('express');
const router = express.Router();
const { searchTailors, getTailor, updateProfile, addPortfolio } = require('../controllers/tailorController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', searchTailors);
router.get('/:id', getTailor);
router.put('/profile', authenticate, authorize('TAILOR'), upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'portfolio', maxCount: 10 },
  { name: 'certificates', maxCount: 10 },
  { name: 'videos', maxCount: 10 }
]), updateProfile);
router.post('/portfolio', authenticate, authorize('TAILOR'), upload.array('files', 10), addPortfolio);

module.exports = router;
