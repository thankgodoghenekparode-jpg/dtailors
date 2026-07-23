const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const searchEmployers = async (req, res) => {
  try {
    const { page, limit, industry, state, city, search } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { about: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }

    const [employers, total] = await Promise.all([
      prisma.employerProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          },
          _count: { select: { jobs: { where: { isActive: true } } } }
        },
        skip,
        take: l,
        orderBy: { companyName: 'asc' }
      }),
      prisma.employerProfile.count({ where })
    ]);

    res.json(formatPaginationResponse(employers, total, p, l));
  } catch (error) {
    console.error('SearchEmployers error:', error);
    res.status(500).json({ error: 'Failed to search employers' });
  }
};

const getEmployer = async (req, res) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, createdAt: true }
        },
        jobs: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!employer) {
      return res.status(404).json({ error: 'Employer not found' });
    }

    res.json({ employer });
  } catch (error) {
    console.error('GetEmployer error:', error);
    res.status(500).json({ error: 'Failed to fetch employer' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { companyName, about, industry, location, whatsapp, phone, email, facebook } = req.body;

    const updateData = {};
    if (companyName) updateData.companyName = companyName;
    if (about) updateData.about = about;
    if (industry) updateData.industry = industry;
    if (location) updateData.location = location;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (facebook !== undefined) updateData.facebook = facebook;

    if (req.files && req.files.logo && req.files.logo[0]) {
      updateData.logo = `/uploads/${req.files.logo[0].filename}`;
    }

    const employer = await prisma.employerProfile.update({
      where: { userId: req.user.id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } }
      }
    });

    res.json({ message: 'Profile updated', employer });
  } catch (error) {
    console.error('UpdateEmployerProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

const createJob = async (req, res) => {
  try {
    const {
      title, description, salary, experienceRequired, jobType,
      accommodation, state, city, contactDetails, whatsapp, phone, email, facebook, expiresAt
    } = req.body;

    if (!title || !jobType) {
      return res.status(400).json({ error: 'Title and job type are required' });
    }

    const validJobTypes = ['FULL_TIME', 'PART_TIME', 'APPRENTICESHIP', 'INTERNSHIP'];
    if (!validJobTypes.includes(jobType)) {
      return res.status(400).json({ error: 'Invalid job type' });
    }

    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    const job = await prisma.job.create({
      data: {
        employerId: employer.id,
        title,
        description: description || null,
        salary: salary ? parseFloat(salary) : null,
        experienceRequired: experienceRequired || null,
        jobType,
        accommodation: accommodation || null,
        state: state || null,
        city: city || null,
        contactDetails: contactDetails || null,
        whatsapp: whatsapp || null,
        phone: phone || null,
        email: email || null,
        facebook: facebook || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.status(201).json({ message: 'Job created', job });
  } catch (error) {
    console.error('CreateJob error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

const getJobs = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!employer) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { employerId: employer.id },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.job.count({ where: { employerId: employer.id } })
    ]);

    res.json(formatPaginationResponse(jobs, total, p, l));
  } catch (error) {
    console.error('GetEmployerJobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

module.exports = { searchEmployers, getEmployer, updateProfile, createJob, getJobs };
