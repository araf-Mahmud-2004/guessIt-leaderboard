const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validateUserRegistration, validateUserUpdate } = require('../middleware/validation');

// Public routes
router.post('/', validateUserRegistration, userController.createUser);

// Protected routes (require authentication)
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);

// Admin only routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/:id', authorize('admin'), userController.getUserById);
router.put('/:id', authorize('admin'), validateUserUpdate, userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;