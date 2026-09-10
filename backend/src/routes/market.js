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
  addReview,
  getRelatedProducts,
  getSellerProductsById
} = require('../controllers/marketController');
const { createProduct } = require('../controllers/sellerController');
const { getSeller } = require('../controllers/sellerController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Browse & Categories
router.get('/', browseProducts);
router.get('/products', browseProducts);
router.get('/categories', getCategories);

// Seller store routes inside market
router.get('/sellers/:id', getSeller);
router.get('/sellers/:id/products', getSellerProductsById);

// Product creation
router.post('/', authenticate, upload.fields([{ name: 'images', maxCount: 10 }]), createProduct);
router.post('/products', authenticate, upload.fields([{ name: 'images', maxCount: 10 }]), createProduct);

// Product sub-routes
router.get('/products/:id/related', getRelatedProducts);
router.get('/:id/related', getRelatedProducts);

router.get('/products/:id/reviews', getProductDetail);
router.get('/:id/reviews', getProductDetail);

router.get('/products/:id/wishlist/check', authenticate, checkWishlist);
router.get('/:id/wishlist/check', authenticate, checkWishlist);

router.post('/products/:id/wishlist', authenticate, toggleWishlist);
router.post('/:id/wishlist', authenticate, toggleWishlist);

router.post('/products/:id/reviews', authenticate, addReview);
router.post('/:id/reviews', authenticate, addReview);

// Product CRUD
router.get('/products/:id', getProductDetail);
router.get('/:id', getProductDetail);

router.put('/products/:id', authenticate, upload.fields([{ name: 'images', maxCount: 10 }]), updateProduct);
router.put('/:id', authenticate, upload.fields([{ name: 'images', maxCount: 10 }]), updateProduct);

router.delete('/products/:id', authenticate, deleteProduct);
router.delete('/:id', authenticate, deleteProduct);

module.exports = router;
