const express = require('express');
const router = express.Router();
const {
  browseProducts,
  getCategories,
  getProductDetail,
  updateProduct,
  deleteProduct,
  toggleWishlist,
  checkWishlist,
  addReview
} = require('../controllers/marketController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', browseProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductDetail);
router.put('/:id', authenticate, upload.fields([
  { name: 'images', maxCount: 10 }
]), updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.post('/:id/wishlist', authenticate, toggleWishlist);
router.get('/:id/wishlist/check', authenticate, checkWishlist);
router.post('/:id/reviews', authenticate, addReview);

module.exports = router;
