const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const tailorRoutes = require('./routes/tailors');
const vendorRoutes = require('./routes/vendors');
const employerRoutes = require('./routes/employers');
const productRoutes = require('./routes/products');
const jobRoutes = require('./routes/jobs');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const sellerRoutes = require('./routes/sellers');
const marketRoutes = require('./routes/market');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const marketAdminRoutes = require('./routes/marketAdmin');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/tailors', tailorRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/market-admin', marketAdminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'D Tailors Marketplace API is running' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === 'Invalid file type') {
    return res.status(400).json({ error: 'Invalid file type. Only images and videos are allowed.' });
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
  }
});

const onlineUsers = new Set();

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    return next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  onlineUsers.add(userId);
  socket.join(`user:${userId}`);
  io.emit('userOnline', { userId });

  socket.on('sendMessage', async (data, callback) => {
    try {
      const { conversationId, content, type, imageUrl, fileUrl, replyToId } = data;

      const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conversation) {
        if (typeof callback === 'function') callback({ error: 'Conversation not found' });
        return;
      }

      const seller = await prisma.sellerProfile.findUnique({ where: { userId } });
      const isParticipant = conversation.buyerId === userId || (seller && conversation.sellerId === seller.id);
      if (!isParticipant) {
        if (typeof callback === 'function') callback({ error: 'Not authorized' });
        return;
      }

      const msgType = type || 'text';
      const isBuyer = conversation.buyerId === userId;

      const message = await prisma.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: content || (msgType === 'image' ? 'Image' : msgType === 'file' ? 'File' : ''),
          type: msgType,
          imageUrl: imageUrl || null,
          fileUrl: fileUrl || null,
          replyToId: replyToId || null,
          status: 'sent'
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } }
        }
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content || (msgType === 'image' ? '[Image]' : msgType === 'file' ? '[File]' : ''),
          lastMessageAt: new Date(),
          ...(isBuyer ? { sellerUnread: { increment: 1 } } : { buyerUnread: { increment: 1 } })
        }
      });

      const recipientId = isBuyer
        ? (await prisma.sellerProfile.findUnique({ where: { id: conversation.sellerId } })).userId
        : conversation.buyerId;

      io.to(`user:${recipientId}`).emit('newMessage', { conversationId, message });
      io.to(`user:${userId}`).emit('newMessage', { conversationId, message });

      if (typeof callback === 'function') callback({ success: true, message });
    } catch (error) {
      console.error('Socket sendMessage error:', error);
      if (typeof callback === 'function') callback({ error: 'Failed to send message' });
    }
  });

  socket.on('typing', (data) => {
    try {
      const { conversationId, isTyping } = data;
      const recipientId = getOtherParticipantId(conversationId, userId);
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('typing', { conversationId, userId, isTyping });
      }
    } catch (error) {
      console.error('Socket typing error:', error);
    }
  });

  socket.on('markRead', async (data) => {
    try {
      const { conversationId } = data;
      const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
      if (!conversation) return;

      await prisma.message.updateMany({
        where: { conversationId, isDeleted: false },
        data: { status: 'read' }
      });

      const isBuyer = conversation.buyerId === userId;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: isBuyer ? { buyerUnread: 0 } : { sellerUnread: 0 }
      });

      const recipientId = isBuyer
        ? (await prisma.sellerProfile.findUnique({ where: { id: conversation.sellerId } })).userId
        : conversation.buyerId;
      io.to(`user:${recipientId}`).emit('markRead', { conversationId, userId });
    } catch (error) {
      console.error('Socket markRead error:', error);
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    io.emit('userOffline', { userId });
  });
});

async function getOtherParticipantId(conversationId, currentUserId) {
  try {
    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) return null;
    if (conversation.buyerId === currentUserId) {
      const seller = await prisma.sellerProfile.findUnique({ where: { id: conversation.sellerId } });
      return seller ? seller.userId : null;
    }
    return conversation.buyerId;
  } catch (error) {
    console.error('GetOtherParticipantId error:', error);
    return null;
  }
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
