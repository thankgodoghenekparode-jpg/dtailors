const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const getAllJobs = async (req, res) => {
  try {
    const { page, limit, state, city, jobType, minSalary, maxSalary, accommodation, search } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (state) {
      where.state = { contains: state, mode: 'insensitive' };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (minSalary || maxSalary) {
      where.salary = {};
      if (minSalary) where.salary.gte = parseFloat(minSalary);
      if (maxSalary) where.salary.lte = parseFloat(maxSalary);
    }

    if (accommodation) {
      where.accommodation = { contains: accommodation, mode: 'insensitive' };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: { id: true, companyName: true, logo: true },
            include: { user: { select: { name: true, avatar: true } } }
          }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.job.count({ where })
    ]);

    res.json(formatPaginationResponse(jobs, total, p, l));
  } catch (error) {
    console.error('GetAllJobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

const getJob = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        employer: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } }
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('GetJob error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

const updateJob = async (req, res) => {
  try {
    const {
      title, description, salary, experienceRequired, jobType,
      accommodation, state, city, contactDetails, whatsapp, phone, email, facebook,
      isActive, expiresAt
    } = req.body;

    const existingJob = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!employer || existingJob.employerId !== employer.id) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (salary !== undefined) updateData.salary = salary ? parseFloat(salary) : null;
    if (experienceRequired !== undefined) updateData.experienceRequired = experienceRequired;
    if (jobType) {
      const validJobTypes = ['FULL_TIME', 'PART_TIME', 'APPRENTICESHIP', 'INTERNSHIP'];
      if (!validJobTypes.includes(jobType)) {
        return res.status(400).json({ error: 'Invalid job type' });
      }
      updateData.jobType = jobType;
    }
    if (accommodation !== undefined) updateData.accommodation = accommodation;
    if (state !== undefined) updateData.state = state;
    if (city !== undefined) updateData.city = city;
    if (contactDetails !== undefined) updateData.contactDetails = contactDetails;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (facebook !== undefined) updateData.facebook = facebook;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ message: 'Job updated', job });
  } catch (error) {
    console.error('UpdateJob error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

const deleteJob = async (req, res) => {
  try {
    const existingJob = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const employer = await prisma.employerProfile.findUnique({ where: { userId: req.user.id } });
    if (!employer || existingJob.employerId !== employer.id) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    await prisma.job.delete({ where: { id: req.params.id } });

    res.json({ message: 'Job deleted' });
  } catch (error) {
    console.error('DeleteJob error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

module.exports = { getAllJobs, getJob, updateJob, deleteJob };
