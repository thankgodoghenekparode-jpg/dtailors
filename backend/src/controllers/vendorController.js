const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const searchVendors = async (req, res) => {
  try {
    const { page, limit, category, state, city, search } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { about: { contains: search, mode: 'insensitive' } },
        { categories: { has: search } }
      ];
    }

    if (category) {
      where.categories = { has: category };
    }

    const [vendors, total] = await Promise.all([
      prisma.vendorProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          _count: { select: { products: true } }
        },
        skip,
        take: l,
        orderBy: { rating: 'desc' }
      }),
      prisma.vendorProfile.count({ where })
    ]);

    res.json(formatPaginationResponse(vendors, total, p, l));
  } catch (error) {
    console.error('SearchVendors error:', error);
    res.status(500).json({ error: 'Failed to search vendors' });
  }
};

const getVendor = async (req, res) => {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, createdAt: true }
        },
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ vendor });
  } catch (error) {
    console.error('GetVendor error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      businessName, about, categories, deliveryOptions,
      whatsapp, phone, facebook, instagram, tiktok, website, location
    } = req.body;

    const updateData = {};
    if (businessName) updateData.businessName = businessName;
    if (about) updateData.about = about;
    if (categories) updateData.categories = categories;
    if (deliveryOptions) updateData.deliveryOptions = deliveryOptions;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (phone !== undefined) updateData.phone = phone;
    if (facebook !== undefined) updateData.facebook = facebook;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (tiktok !== undefined) updateData.tiktok = tiktok;
    if (website !== undefined) updateData.website = website;
    if (location) updateData.location = location;

    if (req.files && req.files.logo && req.files.logo[0]) {
      updateData.logo = `/uploads/${req.files.logo[0].filename}`;
    }

    const vendor = await prisma.vendorProfile.update({
      where: { userId: req.user.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    res.json({ message: 'Profile updated', vendor });
  } catch (error) {
    console.error('UpdateVendorProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, discount, category, subcategory,
      deliveryOptions, location, images: bodyImages
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    let vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    if (!vendor) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      vendor = await prisma.vendorProfile.create({
        data: {
          userId: req.user.id,
          businessName: user?.name ? `${user.name}'s Fabric Store` : 'My Fabric Store',
          about: 'Quality fabrics and textiles'
        }
      });
    }

    let images = [];
    const videos = [];

    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach(f => images.push(`/uploads/${f.filename}`));
      }
      if (req.files.videos) {
        req.files.videos.forEach(f => videos.push(`/uploads/${f.filename}`));
      }
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
      images = ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80'];
    }

    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        name,
        description: description || null,
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : null,
        images,
        videos,
        category,
        subcategory: subcategory || null,
        deliveryOptions: deliveryOptions ? (typeof deliveryOptions === 'string' ? JSON.parse(deliveryOptions) : deliveryOptions) : [],
        location: location ? (typeof location === 'string' ? JSON.parse(location) : location) : null
      }
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    console.error('CreateProduct error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

const getProducts = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    let vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user.id } });
    if (!vendor) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      vendor = await prisma.vendorProfile.create({
        data: {
          userId: req.user.id,
          businessName: user?.name ? `${user.name}'s Fabric Store` : 'My Fabric Store',
          about: 'Quality fabrics and textiles'
        }
      });
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { vendorId: vendor.id },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where: { vendorId: vendor.id } })
    ]);

    res.json(formatPaginationResponse(products, total, p, l));
  } catch (error) {
    console.error('GetVendorProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

module.exports = { searchVendors, getVendor, updateProfile, createProduct, getProducts };
