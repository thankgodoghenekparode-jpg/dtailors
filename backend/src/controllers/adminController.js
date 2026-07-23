const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalTailors, totalVendors, totalEmployers, totalProducts, totalJobs, totalReviews] = await Promise.all([
      prisma.user.count(),
      prisma.tailorProfile.count(),
      prisma.vendorProfile.count(),
      prisma.employerProfile.count(),
      prisma.product.count(),
      prisma.job.count(),
      prisma.review.count()
    ]);

    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    const recentProducts = await prisma.product.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, price: true, category: true, createdAt: true }
    });

    const recentJobs = await prisma.job.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, jobType: true, state: true, createdAt: true }
    });

    res.json({
      stats: {
        totalUsers,
        totalTailors,
        totalVendors,
        totalEmployers,
        totalProducts,
        totalJobs,
        totalReviews
      },
      recentUsers,
      recentProducts,
      recentJobs
    });
  } catch (error) {
    console.error('GetDashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page, limit, role, search } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, phone: true, name: true, role: true, avatar: true, createdAt: true,
          tailorProfile: true,
          vendorProfile: true,
          employerProfile: true
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json(formatPaginationResponse(users, total, p, l));
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const verifyUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Account Verified',
        message: 'Your account has been verified by an administrator.',
        type: 'SYSTEM'
      }
    });

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    console.error('VerifyUser error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
};

const getReports = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    });

    const productsByCategory = await prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20
    });

    const jobsByType = await prisma.job.groupBy({
      by: ['jobType'],
      _count: { id: true }
    });

    const averageRatings = await prisma.review.aggregate({
      _avg: { rating: true },
      _count: { rating: true }
    });

    res.json({
      usersByRole,
      productsByCategory,
      jobsByType,
      averageRatings: {
        average: averageRatings._avg.rating ? Math.round(averageRatings._avg.rating * 10) / 10 : 0,
        totalReviews: averageRatings._count.rating
      }
    });
  } catch (error) {
    console.error('GetReports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const { resource, id } = req.params;

    const validResources = {
      users: prisma.user,
      products: prisma.product,
      jobs: prisma.job,
      reviews: prisma.review,
      notifications: prisma.notification
    };

    if (!validResources[resource]) {
      return res.status(400).json({ error: 'Invalid resource type' });
    }

    const existing = await validResources[resource].findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: `${resource.slice(0, -1)} not found` });
    }

    await validResources[resource].delete({ where: { id } });

    res.json({ message: `${resource.slice(0, -1)} deleted successfully` });
  } catch (error) {
    console.error('DeleteResource error:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
};

module.exports = { getDashboard, getUsers, verifyUser, getReports, deleteResource };
