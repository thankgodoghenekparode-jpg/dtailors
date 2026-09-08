const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const getCart = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const [items, total] = await Promise.all([
      prisma.cartItem.findMany({
        where: { userId: req.user.id },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true, storeName: true, logo: true, isVerified: true
                }
              }
            }
          }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.cartItem.count({ where: { userId: req.user.id } })
    ]);

    const subtotal = items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    res.json({
      data: items,
      pagination: {
        total, page: p, limit: l, totalPages: Math.ceil(total / l)
      },
      subtotal
    });
  } catch (error) {
    console.error('GetCart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const qty = parseInt(quantity) || 1;

    const product = await prisma.marketProduct.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.isActive || product.status !== 'active') {
      return res.status(400).json({ error: 'Product is not available' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ error: `Only ${product.stock} items in stock` });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } }
    });

    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({ error: `Only ${product.stock} items in stock` });
      }
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: true }
      });
      return res.json({ message: 'Cart updated', item: updated });
    }

    const item = await prisma.cartItem.create({
      data: { userId: req.user.id, productId, quantity: qty },
      include: { product: true }
    });

    res.status(201).json({ message: 'Added to cart', item });
  } catch (error) {
    console.error('AddToCart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const existing = await prisma.cartItem.findUnique({
      where: { id: req.params.itemId },
      include: { product: true }
    });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    if (qty > existing.product.stock) {
      return res.status(400).json({ error: `Only ${existing.product.stock} items in stock` });
    }

    const item = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: qty },
      include: { product: true }
    });

    res.json({ message: 'Cart updated', item });
  } catch (error) {
    console.error('UpdateCartItem error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const existing = await prisma.cartItem.findUnique({ where: { id: req.params.itemId } });

    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: req.params.itemId } });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('RemoveCartItem error:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
};

const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('ClearCart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
