const { PrismaClient } = require('@prisma/client');
const { paginate, formatPaginationResponse } = require('../utils/helpers');

const prisma = new PrismaClient();

const getMyNotifications = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = paginate(page, limit);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l
      }),
      prisma.notification.count({ where: { userId: req.user.id } })
    ]);

    const unread = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    const result = formatPaginationResponse(notifications, total, p, l);
    result.unreadCount = unread;

    res.json(result);
  } catch (error) {
    console.error('GetMyNotifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('MarkAllNotificationsRead error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this notification' });
    }

    await prisma.notification.delete({ where: { id: req.params.id } });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('DeleteNotification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

module.exports = { getMyNotifications, markAllRead, deleteNotification };
