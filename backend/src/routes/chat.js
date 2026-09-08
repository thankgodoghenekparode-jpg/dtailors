const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  listConversations,
  getMessages,
  sendMessage,
  markMessageRead,
  deleteMessage,
  updateMessageStatus
} = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/conversations', authenticate, getOrCreateConversation);
router.get('/conversations', authenticate, listConversations);
router.get('/conversations/:id/messages', authenticate, getMessages);
router.post('/conversations/:id/messages', authenticate, sendMessage);
router.put('/messages/:id/read', authenticate, markMessageRead);
router.delete('/messages/:id', authenticate, deleteMessage);
router.put('/messages/:id/status', authenticate, updateMessageStatus);

module.exports = router;
