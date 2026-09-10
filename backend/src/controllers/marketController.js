const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const browseProducts = async (req, res) => {
  try {
    const {
      page, limit, category, condition, minPrice, maxPrice, search, sortBy, inStock
    } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = { isActive: true, status: 'active' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (condition) {
      where.condition = condition;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (inStock === 'true' || inStock === true) {
      where.stock = { gt: 0 };
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };
    if (sortBy === 'rating') orderBy = { rating: 'desc' };
    if (sortBy === 'popular') orderBy = { reviewCount: 'desc' };

    const [products, total] = await Promise.all([
      prisma.marketProduct.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true, storeName: true, logo: true, rating: true, isVerified: true
            }
          }
        },
        skip,
        take: l,
        orderBy
      }),
      prisma.marketProduct.count({ where })
    ]);

    res.json(formatPaginationResponse(products, total, p, l));
  } catch (error) {
    console.error('BrowseProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getCategories = async (req, res) => {
  try {
    const products = await prisma.marketProduct.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });

    const categories = products.map(p => p.category);
    res.json({ categories });
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const getProductDetail = async (req, res) => {
  try {
    const product = await prisma.marketProduct.findUnique({
      where: { id: req.params.id },
      include: {
        seller: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } }
          }
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true, avatar: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('GetProductDetail error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name, description, price, discountPrice, category, stock,
      location, condition, sizes, colors, specifications, status
    } = req.body;

    const existing = await prisma.marketProduct.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seller || existing.sellerId !== seller.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (category) updateData.category = category;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (location) updateData.location = typeof location === 'string' ? JSON.parse(location) : location;
    if (condition) updateData.condition = condition;
    if (sizes) updateData.sizes = Array.isArray(sizes) ? sizes : JSON.parse(sizes);
    if (colors) updateData.colors = Array.isArray(colors) ? colors : JSON.parse(colors);
    if (specifications) updateData.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
    if (status) updateData.status = status;

    if (req.files && req.files.images) {
      const newImages = req.files.images.map(f => `/uploads/${f.filename}`);
      updateData.images = [...(existing.images || []), ...newImages];
    }

    const product = await prisma.marketProduct.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('UpdateMarketProduct error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const existing = await prisma.marketProduct.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seller || existing.sellerId !== seller.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await prisma.marketProduct.delete({ where: { id: req.params.id } });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('DeleteMarketProduct error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await prisma.marketProduct.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } }
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ message: 'Removed from wishlist', inWishlist: false });
    }

    await prisma.wishlist.create({
      data: { userId: req.user.id, productId }
    });

    res.status(201).json({ message: 'Added to wishlist', inWishlist: true });
  } catch (error) {
    console.error('ToggleWishlist error:', error);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
};

const checkWishlist = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ inWishlist: false });
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user.id, productId: req.params.id } }
    });

    res.json({ inWishlist: !!existing });
  } catch (error) {
    console.error('CheckWishlist error:', error);
    res.status(500).json({ error: 'Failed to check wishlist' });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const product = await prisma.marketProduct.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = await prisma.marketReview.create({
      data: {
        reviewerId: req.user.id,
        productId,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } }
      }
    });

    const allReviews = await prisma.marketReview.findMany({ where: { productId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.marketProduct.update({
      where: { id: productId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length }
    });

    const sellerReviews = await prisma.marketReview.findMany({
      where: { product: { sellerId: product.sellerId } }
    });
    const sellerAvg = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / (sellerReviews.length || 1);

    await prisma.sellerProfile.update({
      where: { id: product.sellerId },
      data: {
        rating: sellerReviews.length ? Math.round(sellerAvg * 10) / 10 : 0,
        reviewCount: sellerReviews.length
      }
    });

    res.status(201).json({ message: 'Review added', review });
  } catch (error) {
    console.error('AddMarketReview error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const product = await prisma.marketProduct.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.json({ data: [], related: [] });
    }
    const related = await prisma.marketProduct.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        isActive: true,
        status: 'active'
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { id: true, storeName: true, logo: true, rating: true, isVerified: true }
        }
      }
    });
    res.json({ data: related, related });
  } catch (error) {
    console.error('GetRelatedProducts error:', error);
    res.json({ data: [], related: [] });
  }
};

const getSellerProductsById = async (req, res) => {
  try {
    const products = await prisma.marketProduct.findMany({
      where: { sellerId: req.params.id, isActive: true, status: 'active' },
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { id: true, storeName: true, logo: true, rating: true, isVerified: true }
        }
      }
    });
    res.json({ data: products, products });
  } catch (error) {
    console.error('GetSellerProductsById error:', error);
    res.status(500).json({ error: 'Failed to fetch seller products' });
  }
};

module.exports = {
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
};
