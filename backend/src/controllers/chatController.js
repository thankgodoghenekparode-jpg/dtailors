const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const getOrCreateConversation = async (req, res) => {
  try {
    const { sellerId, productId } = req.body;
    const buyerId = req.user.id;

    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID is required' });
    }

    const seller = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    if (seller.userId === buyerId) {
      return res.status(400).json({ error: 'Cannot start a conversation with yourself' });
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        buyerId,
        sellerId,
        ...(productId ? { productId } : {})
      }
    });

    if (existing) {
      const conv = await prisma.conversation.findUnique({
        where: { id: existing.id },
        include: {
          buyer: { select: { id: true, name: true, avatar: true } },
          seller: {
            select: { id: true, storeName: true, logo: true },
            include: { user: { select: { name: true, avatar: true } } }
          },
          product: { select: { id: true, name: true, images: true, price: true } }
        }
      });
      return res.json({ conversation: conv });
    }

    const conversation = await prisma.conversation.create({
      data: {
        buyerId,
        sellerId,
        productId: productId || null
      },
      include: {
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: {
          select: { id: true, storeName: true, logo: true },
          include: { user: { select: { name: true, avatar: true } } }
        },
        product: { select: { id: true, name: true, images: true, price: true } }
      }
    });

    res.status(201).json({ conversation });
  } catch (error) {
    console.error('GetOrCreateConversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

const listConversations = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });

    const where = seller
      ? { OR: [{ buyerId: req.user.id }, { sellerId: seller.id }] }
      : { buyerId: req.user.id };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          buyer: { select: { id: true, name: true, avatar: true } },
          seller: {
            select: { id: true, storeName: true, logo: true },
            include: { user: { select: { name: true, avatar: true } } }
          },
          product: { select: { id: true, name: true, images: true, price: true } }
        },
        skip,
        take: l,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.conversation.count({ where })
    ]);

    const sellerIds = new Set(seller ? [seller.id] : []);
    const enriched = conversations.map(conv => {
      const isBuyer = conv.buyerId === req.user.id;
      const unreadCount = isBuyer ? conv.buyerUnread : conv.sellerUnread;
      const other = isBuyer ? {
        id: conv.seller.id,
        name: conv.seller.storeName,
        avatar: conv.seller.logo,
        type: 'seller'
      } : {
        id: conv.buyer.id,
        name: conv.buyer.name,
        avatar: conv.buyer.avatar,
        type: 'buyer'
      };
      return { ...conv, unreadCount, otherParticipant: other };
    });

    res.json(formatPaginationResponse(enriched, total, p, l));
  } catch (error) {
    console.error('ListConversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    const isParticipant = conversation.buyerId === req.user.id || (seller && conversation.sellerId === seller.id);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: conversation.id, isDeleted: false },
        include: {
          sender: { select: { id: true, name: true, avatar: true } }
        },
        skip,
        take: l,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.message.count({ where: { conversationId: conversation.id, isDeleted: false } })
    ]);

    const sortedMessages = messages.reverse();

    await prisma.message.updateMany({
      where: { conversationId: conversation.id, isDeleted: false },
      data: { status: 'read' }
    });

    const isBuyer = conversation.buyerId === req.user.id;
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: isBuyer ? { buyerUnread: 0 } : { sellerUnread: 0 }
    });

    res.json(formatPaginationResponse(sortedMessages, total, p, l));
  } catch (error) {
    console.error('GetMessages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, type, imageUrl, fileUrl, replyToId } = req.body;

    const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    const isParticipant = conversation.buyerId === req.user.id || (seller && conversation.sellerId === seller.id);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized to send messages here' });
    }

    if (!content && !imageUrl && !fileUrl) {
      return res.status(400).json({ error: 'Message content or attachment is required' });
    }

    const msgType = type || 'text';
    const isBuyer = conversation.buyerId === req.user.id;

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: req.user.id,
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

    const updated = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: content || (msgType === 'image' ? '[Image]' : msgType === 'file' ? '[File]' : ''),
        lastMessageAt: new Date(),
        ...(isBuyer ? { sellerUnread: { increment: 1 } } : { buyerUnread: { increment: 1 } })
      }
    });

    res.status(201).json({ message: 'Message sent', msg: message });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const markMessageRead = async (req, res) => {
  try {
    const message = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const conversation = await prisma.conversation.findUnique({ where: { id: message.conversationId } });
    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    const isParticipant = conversation.buyerId === req.user.id || (seller && conversation.sellerId === seller.id);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.message.update({
      where: { id: req.params.id },
      data: { status: 'read' }
    });

    res.json({ message: 'Message marked as read', msg: updated });
  } catch (error) {
    console.error('MarkMessageRead error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ error: 'Only the sender can delete this message' });
    }

    await prisma.message.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    });

    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('DeleteMessage error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['sent', 'delivered', 'read'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const message = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const conversation = await prisma.conversation.findUnique({ where: { id: message.conversationId } });
    const seller = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    const isParticipant = conversation.buyerId === req.user.id || (seller && conversation.sellerId === seller.id);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.message.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({ message: 'Status updated', msg: updated });
  } catch (error) {
    console.error('UpdateMessageStatus error:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
};

module.exports = {
  getOrCreateConversation,
  listConversations,
  getMessages,
  sendMessage,
  markMessageRead,
  deleteMessage,
  updateMessageStatus
};
