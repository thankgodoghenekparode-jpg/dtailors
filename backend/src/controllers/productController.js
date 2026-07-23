const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const getAllProducts = async (req, res) => {
  try {
    const { page, limit, category, subcategory, minPrice, maxPrice, minRating, state, city, search, sortBy } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = { isActive: true };

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

    if (subcategory) {
      where.subcategory = { contains: subcategory, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    if (sortBy === 'rating') orderBy = { rating: 'desc' };
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: {
            select: { id: true, businessName: true, logo: true, rating: true },
            include: { user: { select: { name: true } } }
          }
        },
        skip,
        take: l,
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    res.json(formatPaginationResponse(products, total, p, l));
  } catch (error) {
    console.error('GetAllProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        vendor: {
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
    console.error('GetProduct error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const {
      name, description, price, discount, category, subcategory,
      deliveryOptions, location, isActive
    } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    if (!vendor || existingProduct.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discount !== undefined) updateData.discount = discount ? parseFloat(discount) : null;
    if (category) updateData.category = category;
    if (subcategory !== undefined) updateData.subcategory = subcategory;
    if (deliveryOptions) updateData.deliveryOptions = typeof deliveryOptions === 'string' ? JSON.parse(deliveryOptions) : deliveryOptions;
    if (location) updateData.location = typeof location === 'string' ? JSON.parse(location) : location;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

    if (req.files) {
      const existingImages = existingProduct.images || [];
      const existingVideos = existingProduct.videos || [];

      if (req.files.images) {
        const newImages = req.files.images.map(f => `/uploads/${f.filename}`);
        updateData.images = [...existingImages, ...newImages];
      }
      if (req.files.videos) {
        const newVideos = req.files.videos.map(f => `/uploads/${f.filename}`);
        updateData.videos = [...existingVideos, ...newVideos];
      }
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const existingProduct = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    if (!vendor || existingProduct.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: req.user.id,
        reviewedId: product.vendorId,
        productId,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } }
      }
    });

    const allReviews = await prisma.review.findMany({ where: { productId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length }
    });

    res.status(201).json({ message: 'Review added', review });
  } catch (error) {
    console.error('AddProductReview error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: req.params.id },
        include: {
          reviewer: { select: { id: true, name: true, avatar: true } }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where: { productId: req.params.id } })
    ]);

    res.json(formatPaginationResponse(reviews, total, p, l));
  } catch (error) {
    console.error('GetProductReviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = { getAllProducts, getProduct, updateProduct, deleteProduct, addReview, getReviews };
