const { PrismaClient } = require('@prisma/client');
const { generateToken, hashPassword, comparePassword } = require('../utils/helpers');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, phone, name, password, role } = req.body;

    if (!email || !name || !password || !role) {
      return res.status(400).json({ error: 'Email, name, password, and role are required' });
    }

    const validRoles = ['TAILOR', 'VENDOR', 'EMPLOYER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be TAILOR, VENDOR, or EMPLOYER' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        name,
        password: hashedPassword,
        role
      },
      select: { id: true, email: true, phone: true, name: true, role: true, createdAt: true }
    });

    if (role === 'TAILOR') {
      await prisma.tailorProfile.create({ data: { userId: user.id, specializations: [], skills: [], portfolio: [], videos: [], certificates: [], languages: [] } });
    } else if (role === 'VENDOR') {
      await prisma.vendorProfile.create({ data: { userId: user.id, businessName: name, categories: [], deliveryOptions: [] } });
    } else if (role === 'EMPLOYER') {
      await prisma.employerProfile.create({ data: { userId: user.id, companyName: name } });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    res.json({ message: 'OTP verification is not yet implemented' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, phone: true, name: true, role: true, avatar: true, createdAt: true, updatedAt: true,
        tailorProfile: true,
        vendorProfile: true,
        employerProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (req.file) updateData.avatar = `/uploads/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: { id: true, email: true, phone: true, name: true, role: true, avatar: true, createdAt: true, updatedAt: true }
    });

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { register, login, verifyOtp, getMe, updateProfile };
