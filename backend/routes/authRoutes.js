const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { authLimiter, loginLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/register', authLimiter, validateUserRegistration, authController.register);
router.post('/login', loginLimiter, validateUserLogin, authController.login);

// Protected routes
router.post('/logout', protect, authController.logout);

module.exports = router;