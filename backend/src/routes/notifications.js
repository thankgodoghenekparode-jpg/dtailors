const express = require('express');
const router = express.Router();
const { getMyNotifications, markAllRead, deleteNotification } = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getMyNotifications);
router.put('/read-all', authenticate, markAllRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
