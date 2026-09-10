const express = require('express');
const router = express.Router();
const {
  becomeSeller,
  getMyStore,
  updateMyStore,
  searchSellers,
  getSeller,
  createProduct,
  getMyProducts,
  updateOwnProduct,
  deleteOwnProduct,
  getStoreOrders,
  updateOrderStatus,
  getSalesSummary
} = require('../controllers/sellerController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/become-seller', authenticate, becomeSeller);
router.get('/my-store', authenticate, getMyStore);
router.get('/me', authenticate, getMyStore);
router.put('/my-store', authenticate, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), updateMyStore);

router.post('/products', authenticate, upload.fields([
  { name: 'images', maxCount: 10 }
]), createProduct);
router.get('/my-products', authenticate, getMyProducts);
router.put('/products/:id', authenticate, upload.fields([
  { name: 'images', maxCount: 10 }
]), updateOwnProduct);
router.delete('/products/:id', authenticate, deleteOwnProduct);

router.get('/orders', authenticate, getStoreOrders);
router.put('/orders/:id/status', authenticate, updateOrderStatus);
router.get('/sales', authenticate, getSalesSummary);

router.get('/', searchSellers);
router.get('/:id', getSeller);
router.get('/:id/products', getSeller);

module.exports = router;
