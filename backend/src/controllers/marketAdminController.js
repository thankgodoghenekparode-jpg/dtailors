const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const getAllProducts = async (req, res) => {
  try {
    const { page, limit, category, status, search, isActive } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = {};

    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (status) where.status = status;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [products, total] = await Promise.all([
      prisma.marketProduct.findMany({
        where,
        include: {
          seller: {
            select: { id: true, storeName: true, isVerified: true },
            include: { user: { select: { name: true, email: true } } }
          }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.marketProduct.count({ where })
    ]);

    res.json(formatPaginationResponse(products, total, p, l));
  } catch (error) {
    console.error('AdminGetProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const { isActive, status } = req.body;

    const product = await prisma.marketProduct.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (status) updateData.status = status;

    const updated = await prisma.marketProduct.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        seller: { select: { id: true, storeName: true, userId: true } }
      }
    });

    await prisma.notification.create({
      data: {
        userId: updated.seller.userId,
        title: 'Product Status Updated',
        message: `Your product "${updated.name}" was ${updated.isActive ? 'activated' : 'deactivated'} by an administrator.`,
        type: 'MARKET'
      }
    });

    res.json({ message: 'Product status updated', product: updated });
  } catch (error) {
    console.error('AdminUpdateProductStatus error:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.marketProduct.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.marketProduct.delete({ where: { id: req.params.id } });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('AdminDeleteProduct error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const { page, limit, search, isVerified, isActive } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = {};

    if (isVerified !== undefined) where.isVerified = isVerified === 'true' || isVerified === true;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

    if (search) {
      where.OR = [
        { storeName: { contains: search, mode: 'insensitive' } },
        { storeDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [sellers, total] = await Promise.all([
      prisma.sellerProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          _count: { select: { products: true, orders: true } }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sellerProfile.count({ where })
    ]);

    res.json(formatPaginationResponse(sellers, total, p, l));
  } catch (error) {
    console.error('AdminGetSellers error:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
};

const toggleSellerVerify = async (req, res) => {
  try {
    const seller = await prisma.sellerProfile.findUnique({ where: { id: req.params.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const updated = await prisma.sellerProfile.update({
      where: { id: req.params.id },
      data: { isVerified: !seller.isVerified }
    });

    await prisma.notification.create({
      data: {
        userId: updated.userId,
        title: updated.isVerified ? 'Store Verified' : 'Store Verification Revoked',
        message: updated.isVerified
          ? `Your store "${updated.storeName}" has been verified.`
          : `Your store "${updated.storeName}" verification was revoked.`,
        type: 'MARKET'
      }
    });

    res.json({ message: 'Seller verification updated', seller: updated });
  } catch (error) {
    console.error('AdminToggleSellerVerify error:', error);
    res.status(500).json({ error: 'Failed to update seller verification' });
  }
};

const toggleSellerStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const seller = await prisma.sellerProfile.findUnique({ where: { id: req.params.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const active = isActive === undefined ? !seller.isActive : (isActive === 'true' || isActive === true);

    const updated = await prisma.sellerProfile.update({
      where: { id: req.params.id },
      data: { isActive: active }
    });

    res.json({ message: 'Seller status updated', seller: updated });
  } catch (error) {
    console.error('AdminToggleSellerStatus error:', error);
    res.status(500).json({ error: 'Failed to update seller status' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page, limit, status, orderNumber } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = {};

    if (status) where.status = status;
    if (orderNumber) where.orderNumber = { contains: orderNumber, mode: 'insensitive' };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          seller: {
            select: { id: true, storeName: true },
            include: { user: { select: { name: true } } }
          },
          items: { include: { product: true } }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json(formatPaginationResponse(orders, total, p, l));
  } catch (error) {
    console.error('AdminGetOrders error:', error);
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

    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: { include: { product: true } } }
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
    console.error('AdminUpdateOrderStatus error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

module.exports = {
  getAllProducts,
  updateProductStatus,
  deleteProduct,
  getAllSellers,
  toggleSellerVerify,
  toggleSellerStatus,
  getAllOrders,
  updateOrderStatus
};
