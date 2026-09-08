const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const checkout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, phone, notes } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { include: { seller: true } } }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    for (const item of cartItems) {
      if (!item.product.isActive || item.product.status !== 'active') {
        return res.status(400).json({ error: `"${item.product.name}" is not available` });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${item.product.name}"` });
      }
    }

    const grouped = cartItems.reduce((acc, item) => {
      const sellerId = item.product.sellerId;
      if (!acc[sellerId]) acc[sellerId] = [];
      acc[sellerId].push(item);
      return acc;
    }, {});

    const orders = [];

    for (const sellerId of Object.keys(grouped)) {
      const items = grouped[sellerId];
      const totalAmount = items.reduce((sum, item) => {
        const price = item.product.discountPrice || item.product.price;
        return sum + (price * item.quantity);
      }, 0);

      const orderNumber = 'DT' + Date.now() + Math.floor(Math.random() * 1000);

      const order = await prisma.order.create({
        data: {
          userId: req.user.id,
          sellerId,
          orderNumber,
          totalAmount,
          status: 'pending',
          shippingAddress: shippingAddress ? (typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress) : null,
          paymentMethod: paymentMethod || null,
          phone: phone || null,
          notes: notes || null,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.discountPrice || item.product.price
            }))
          }
        },
        include: {
          items: { include: { product: true } },
          seller: { select: { id: true, storeName: true } }
        }
      });

      for (const item of items) {
        await prisma.marketProduct.update({
          where: { id: item.productId },
          data: { stock: item.product.stock - item.quantity }
        });
      }

      await prisma.notification.create({
        data: {
          userId: req.user.id,
          title: 'Order Placed',
          message: `Your order ${orderNumber} was placed successfully.`,
          type: 'ORDER'
        }
      });

      await prisma.notification.create({
        data: {
          userId: order.seller.userId,
          title: 'New Order',
          message: `You received a new order ${orderNumber}.`,
          type: 'ORDER'
        }
      });

      orders.push(order);
    }

    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    res.status(201).json({ message: 'Order(s) placed successfully', orders });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true, name: true, images: true, price: true, discountPrice: true
                }
              }
            }
          },
          seller: {
            select: { id: true, storeName: true, logo: true }
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
    console.error('GetMyOrders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: { select: { id: true, storeName: true, logo: true } }
              }
            }
          }
        },
        user: { select: { id: true, name: true, email: true, phone: true } },
        seller: { select: { id: true, storeName: true, logo: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const isParticipant = order.userId === req.user.id;
    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    const isSeller = seller && order.sellerId === seller.id;

    if (!isParticipant && !isSeller) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json({ order });
  } catch (error) {
    console.error('GetOrderDetail error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }

    for (const item of order.items) {
      const product = await prisma.marketProduct.findUnique({ where: { id: item.productId } });
      if (product) {
        await prisma.marketProduct.update({
          where: { id: item.productId },
          data: { stock: product.stock + item.quantity }
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' },
      include: { items: true }
    });

    res.json({ message: 'Order cancelled', order: updated });
  } catch (error) {
    console.error('CancelOrder error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

module.exports = { checkout, getMyOrders, getOrderDetail, cancelOrder };
