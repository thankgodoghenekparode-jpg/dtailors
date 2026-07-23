const express = require('express');
const router = express.Router();
const { searchVendors, getVendor, updateProfile, createProduct, getProducts } = require('../controllers/vendorController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', searchVendors);
router.get('/:id', getVendor);
router.put('/profile', authenticate, authorize('VENDOR'), upload.fields([
  { name: 'logo', maxCount: 1 }
]), updateProfile);
router.post('/products', authenticate, authorize('VENDOR'), upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), createProduct);
router.get('/products', authenticate, authorize('VENDOR'), getProducts);

module.exports = router;
