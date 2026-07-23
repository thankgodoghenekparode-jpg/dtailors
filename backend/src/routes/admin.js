const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, verifyUser, getReports, deleteResource } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.get('/reports', getReports);
router.delete('/:resource/:id', deleteResource);

module.exports = router;
