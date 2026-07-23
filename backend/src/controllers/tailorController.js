const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const searchTailors = async (req, res) => {
  try {
    const { page, limit, state, city, skill, experience, gender, availability, search } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { bio: { contains: search, mode: 'insensitive' } },
        { specializations: { has: search } },
        { skills: { has: search } }
      ];
    }

    if (state || city) {
      where.location = {};
      if (state) where.location.path = ['state'];
      if (state) where.location.equals = state;
      // For complex JSON filtering we handle it differently
    }

    if (skill) {
      where.skills = { has: skill };
    }

    if (experience) {
      const exp = parseInt(experience);
      if (exp <= 2) {
        where.yearsOfExperience = { lte: 2 };
      } else if (exp <= 5) {
        where.yearsOfExperience = { gte: 3, lte: 5 };
      } else {
        where.yearsOfExperience = { gte: 6 };
      }
    }

    if (gender) {
      where.gender = gender;
    }

    if (availability) {
      where.availability = availability;
    }

    const [tailors, total] = await Promise.all([
      prisma.tailorProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true }
          }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tailorProfile.count({ where })
    ]);

    res.json(formatPaginationResponse(tailors, total, p, l));
  } catch (error) {
    console.error('SearchTailors error:', error);
    res.status(500).json({ error: 'Failed to search tailors' });
  }
};

const getTailor = async (req, res) => {
  try {
    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true, createdAt: true }
        }
      }
    });

    if (!tailor) {
      return res.status(404).json({ error: 'Tailor not found' });
    }

    res.json({ tailor });
  } catch (error) {
    console.error('GetTailor error:', error);
    res.status(500).json({ error: 'Failed to fetch tailor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      photo, age, gender, yearsOfExperience, specializations, skills,
      availability, expectedSalary, bio, languages, certificates,
      location, videos: newVideos
    } = req.body;

    const updateData = {};
    if (age !== undefined) updateData.age = parseInt(age);
    if (gender) updateData.gender = gender;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = parseInt(yearsOfExperience);
    if (specializations) updateData.specializations = specializations;
    if (skills) updateData.skills = skills;
    if (availability) updateData.availability = availability;
    if (expectedSalary !== undefined) updateData.expectedSalary = parseFloat(expectedSalary);
    if (bio) updateData.bio = bio;
    if (languages) updateData.languages = languages;
    if (certificates) updateData.certificates = certificates;
    if (location) updateData.location = location;

    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        updateData.photo = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.videos) {
        const videoPaths = req.files.videos.map(f => `/uploads/${f.filename}`);
        updateData.videos = videoPaths;
      }
    }

    const tailor = await prisma.tailorProfile.update({
      where: { userId: req.user.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } }
      }
    });

    res.json({ message: 'Profile updated', tailor });
  } catch (error) {
    console.error('UpdateTailorProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const addPortfolio = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const newFiles = req.files.map(f => `/uploads/${f.filename}`);

    const tailor = await prisma.tailorProfile.findUnique({ where: { userId: req.user.id } });
    if (!tailor) {
      return res.status(404).json({ error: 'Tailor profile not found' });
    }

    const updatedPortfolio = [...(tailor.portfolio || []), ...newFiles];

    const updated = await prisma.tailorProfile.update({
      where: { userId: req.user.id },
      data: { portfolio: updatedPortfolio }
    });

    res.json({ message: 'Portfolio updated', portfolio: updated.portfolio });
  } catch (error) {
    console.error('AddPortfolio error:', error);
    res.status(500).json({ error: 'Failed to add portfolio items' });
  }
};

module.exports = { searchTailors, getTailor, updateProfile, addPortfolio };
