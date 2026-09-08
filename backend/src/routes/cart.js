const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getCart);
router.post('/add', authenticate, addToCart);
router.put('/:itemId', authenticate, updateCartItem);
router.delete('/:itemId', authenticate, removeCartItem);
router.delete('/clear', authenticate, clearCart);

module.exports = router;
