const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const createReview = async (req, res) => {
  try {
    const { reviewedId, rating, comment } = req.body;

    if (!reviewedId || !rating) {
      return res.status(400).json({ error: 'reviewedId and rating are required' });
    }

    const r = parseInt(rating);
    if (r < 1 || r > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (reviewedId === req.user.id) {
      return res.status(400).json({ error: 'You cannot review yourself' });
    }

    const reviewedUser = await prisma.user.findUnique({ where: { id: reviewedId } });
    if (!reviewedUser) {
      return res.status(404).json({ error: 'User to review not found' });
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: req.user.id,
        reviewedId,
        rating: r,
        comment: comment || null
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
        reviewed: { select: { id: true, name: true } }
      }
    });

    const allReviews = await prisma.review.findMany({ where: { reviewedId } });
    const avgRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0) / allReviews.length;

    if (reviewedUser.role === 'VENDOR') {
      await prisma.vendorProfile.update({
        where: { userId: reviewedId },
        data: { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length }
      });
    }

    res.status(201).json({ message: 'Review created', review });
  } catch (error) {
    console.error('CreateReview error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

const getReviews = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { reviewedId: req.params.reviewedId },
        include: {
          reviewer: { select: { id: true, name: true, avatar: true } }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where: { reviewedId: req.params.reviewedId } })
    ]);

    const avgResult = await prisma.review.aggregate({
      where: { reviewedId: req.params.reviewedId },
      _avg: { rating: true }
    });

    res.json({
      ...formatPaginationResponse(reviews, total, p, l),
      averageRating: avgResult._avg.rating ? Math.round(avgResult._avg.rating * 10) / 10 : 0
    });
  } catch (error) {
    console.error('GetReviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

module.exports = { createReview, getReviews };
