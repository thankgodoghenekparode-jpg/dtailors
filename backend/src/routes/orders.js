const express = require('express');
const router = express.Router();
const { checkout, getMyOrders, getOrderDetail, cancelOrder } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.post('/checkout', authenticate, checkout);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderDetail);
router.post('/:id/cancel', authenticate, cancelOrder);

module.exports = router;
