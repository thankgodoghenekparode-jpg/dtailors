const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const becomeSeller = async (req, res) => {
  try {
    const { storeName, storeDescription, location, phone, whatsapp } = req.body;

    if (!storeName) {
      return res.status(400).json({ error: 'Store name is required' });
    }

    const existing = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(400).json({ error: 'You already have a seller profile' });
    }

    const seller = await prisma.sellerProfile.create({
      data: {
        userId: req.user.id,
        storeName,
        storeDescription: storeDescription || null,
        location: location ? (typeof location === 'string' ? JSON.parse(location) : location) : null,
        phone: phone || null,
        whatsapp: whatsapp || null
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Welcome to the Marketplace',
        message: `Your store "${storeName}" has been created. Start adding products!`,
        type: 'MARKET'
      }
    });

    res.status(201).json({ message: 'Seller profile created', seller });
  } catch (error) {
    console.error('BecomeSeller error:', error);
    res.status(500).json({ error: 'Failed to create seller profile' });
  }
};

const getMyStore = async (req, res) => {
  try {
    let seller = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { products: true, orders: true } }
      }
    });

    if (!seller) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      seller = await prisma.sellerProfile.create({
        data: {
          userId: req.user.id,
          storeName: user?.name ? `${user.name}'s Store` : 'My Store',
          storeDescription: 'Official seller store'
        },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          _count: { select: { products: true, orders: true } }
        }
      });
    }

    res.json({ seller });
  } catch (error) {
    console.error('GetMyStore error:', error);
    res.status(500).json({ error: 'Failed to fetch seller profile' });
  }
};

const updateMyStore = async (req, res) => {
  try {
    const { storeName, storeDescription, location, phone, whatsapp } = req.body;

    const existing = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const updateData = {};
    if (storeName) updateData.storeName = storeName;
    if (storeDescription !== undefined) updateData.storeDescription = storeDescription;
    if (location) updateData.location = typeof location === 'string' ? JSON.parse(location) : location;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;

    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        updateData.logo = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files.banner && req.files.banner[0]) {
        updateData.banner = `/uploads/${req.files.banner[0].filename}`;
      }
    }

    const seller = await prisma.sellerProfile.update({
      where: { userId: req.user.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    res.json({ message: 'Store updated', seller });
  } catch (error) {
    console.error('UpdateMyStore error:', error);
    res.status(500).json({ error: 'Failed to update store' });
  }
};

const searchSellers = async (req, res) => {
  try {
    const { page, limit, search, isVerified } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { storeName: { contains: search, mode: 'insensitive' } },
        { storeDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true' || isVerified === true;
    }

    const [sellers, total] = await Promise.all([
      prisma.sellerProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          _count: { select: { products: true } }
        },
        skip,
        take: l,
        orderBy: { rating: 'desc' }
      }),
      prisma.sellerProfile.count({ where })
    ]);

    res.json(formatPaginationResponse(sellers, total, p, l));
  } catch (error) {
    console.error('SearchSellers error:', error);
    res.status(500).json({ error: 'Failed to search sellers' });
  }
};

const getSeller = async (req, res) => {
  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, createdAt: true }
        },
        products: {
          where: { isActive: true, status: 'active' },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    res.json({ seller });
  } catch (error) {
    console.error('GetSeller error:', error);
    res.status(500).json({ error: 'Failed to fetch seller' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, discountPrice, category, stock,
      location, condition, sizes, colors, specifications, images: bodyImages
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    let seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seller) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      seller = await prisma.sellerProfile.create({
        data: {
          userId: req.user.id,
          storeName: user?.name ? `${user.name}'s Store` : 'My Store',
          storeDescription: 'Official seller store'
        }
      });
    }

    let images = [];
    if (req.files && req.files.images) {
      req.files.images.forEach(f => images.push(`/uploads/${f.filename}`));
    }
    if (images.length === 0 && bodyImages) {
      if (Array.isArray(bodyImages)) {
        images = bodyImages;
      } else if (typeof bodyImages === 'string') {
        try {
          images = JSON.parse(bodyImages);
        } catch {
          images = [bodyImages];
        }
      }
    }

    if (images.length === 0) {
      images = ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80'];
    }

    const product = await prisma.marketProduct.create({
      data: {
        sellerId: seller.id,
        name,
        description: description || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        images,
        category,
        stock: stock ? parseInt(stock) : 1,
        location: location ? (typeof location === 'string' ? JSON.parse(location) : location) : null,
        condition: condition || 'new',
        sizes: sizes ? (Array.isArray(sizes) ? sizes : JSON.parse(sizes)) : [],
        colors: colors ? (Array.isArray(colors) ? colors : JSON.parse(colors)) : [],
        specifications: specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : null
      }
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    console.error('SellerCreateProduct error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const [products, total] = await Promise.all([
      prisma.marketProduct.findMany({
        where: { sellerId: seller.id },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.marketProduct.count({ where: { sellerId: seller.id } })
    ]);

    res.json(formatPaginationResponse(products, total, p, l));
  } catch (error) {
    console.error('GetMyProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const updateOwnProduct = async (req, res) => {
  try {
    const {
      name, description, price, discountPrice, category, stock,
      location, condition, sizes, colors, specifications, isActive
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
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

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
    console.error('SellerUpdateProduct error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

const deleteOwnProduct = async (req, res) => {
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
    console.error('SellerDeleteProduct error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

const getStoreOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const where = { sellerId: seller.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            include: { product: { select: { id: true, name: true, images: true, price: true } } }
          }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json(formatPaginationResponse(orders, total, p, l));
  } catch (error) {
    console.error('GetStoreOrders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.sellerId !== seller.id) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        items: { include: { product: true } }
      }
    });

    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: 'Order Status Updated',
        message: `Your order ${order.orderNumber} status is now "${status}".`,
        type: 'ORDER'
      }
    });

    res.json({ message: 'Order status updated', order: updated });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

const getSalesSummary = async (req, res) => {
  try {
    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const [orders, totalRevenueAgg, totalProducts] = await Promise.all([
      prisma.order.findMany({ where: { sellerId: seller.id } }),
      prisma.order.aggregate({ where: { sellerId: seller.id, status: { not: 'cancelled' } }, _sum: { totalAmount: true } }),
      prisma.marketProduct.count({ where: { sellerId: seller.id } })
    ]);

    const completed = orders.filter(o => o.status === 'completed').length;
    const pending = orders.filter(o => o.status === 'pending').length;

    res.json({
      totalRevenue: totalRevenueAgg._sum.totalAmount || 0,
      totalOrders: orders.length,
      totalProducts,
      completedOrders: completed,
      pendingOrders: pending
    });
  } catch (error) {
    console.error('GetSalesSummary error:', error);
    res.status(500).json({ error: 'Failed to fetch sales summary' });
  }
};

module.exports = {
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
};
