const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class AuthController {
  // Register a new user
  async register(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const user = await userService.createUser(req.body);
      
      // Generate JWT token for automatic login after registration
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user,
          token: token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const result = await userService.authenticateUser(email, password);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Logout user (client-side token removal)
  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  }
}

module.exports = new AuthController();