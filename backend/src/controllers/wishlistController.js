const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const getWishlist = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId: req.user.id },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true, storeName: true, logo: true, rating: true, isVerified: true
                }
              }
            }
          }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.wishlist.count({ where: { userId: req.user.id } })
    ]);

    res.json(formatPaginationResponse(items, total, p, l));
  } catch (error) {
    console.error('GetWishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await prisma.marketProduct.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } }
    });

    if (existing) {
      return res.json({ message: 'Already in wishlist', inWishlist: true });
    }

    await prisma.wishlist.create({
      data: { userId: req.user.id, productId }
    });

    res.status(201).json({ message: 'Added to wishlist', inWishlist: true });
  } catch (error) {
    console.error('AddToWishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    await prisma.wishlist.delete({ where: { id: existing.id } });

    res.json({ message: 'Removed from wishlist', inWishlist: false });
  } catch (error) {
    console.error('RemoveFromWishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
