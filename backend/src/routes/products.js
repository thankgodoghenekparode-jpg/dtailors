const express = require('express');
const router = express.Router();
const { getAllProducts, getProduct, updateProduct, deleteProduct, addReview, getReviews } = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllProducts);
router.get('/:id', getProduct);
router.put('/:id', authenticate, authorize('VENDOR'), upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), updateProduct);
router.delete('/:id', authenticate, authorize('VENDOR'), deleteProduct);
router.post('/:id/reviews', authenticate, addReview);
router.get('/:id/reviews', getReviews);

module.exports = router;
