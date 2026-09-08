const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getAllSellers,
  toggleSellerVerify,
  toggleSellerStatus,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/marketAdminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('ADMIN'));

router.get('/products', getAllProducts);
router.put('/products/:id/status', updateProductStatus);
router.delete('/products/:id', deleteProduct);
router.get('/sellers', getAllSellers);
router.put('/sellers/:id/verify', toggleSellerVerify);
router.put('/sellers/:id/status', toggleSellerStatus);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
