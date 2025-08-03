const gameScoreService = require('../services/gameScoreService');
const { validationResult } = require('express-validator');

class GameScoreController {
  // Record a new game score
  async recordScore(req, res) {
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

      const userId = req.user.userId; // From auth middleware
      const gameData = { ...req.body, userId };

      const gameScore = await gameScoreService.recordGameScore(gameData);

      res.status(201).json({
        success: true,
        message: 'Game score recorded successfully',
        data: gameScore
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get current user's statistics
  async getMyStats(req, res) {
    try {
      const userId = req.user.userId;
      const userStats = await gameScoreService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: userStats
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get current user's game history
  async getMyGameHistory(req, res) {
    try {
      const userId = req.user.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const gameHistory = await gameScoreService.getUserGameHistory(userId, page, limit);

      res.status(200).json({
        success: true,
        data: gameHistory.games,
        pagination: gameHistory.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user statistics by ID (admin only)
  async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      const userStats = await gameScoreService.getUserStats(userId);

      res.status(200).json({
        success: true,
        data: userStats
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user game history by ID (admin only)
  async getUserGameHistory(req, res) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const gameHistory = await gameScoreService.getUserGameHistory(userId, page, limit);

      res.status(200).json({
        success: true,
        data: gameHistory.games,
        pagination: gameHistory.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get global leaderboard
  async getLeaderboard(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const leaderboard = await gameScoreService.getLeaderboard(limit);

      res.status(200).json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get current user's rank
  async getMyRank(req, res) {
    try {
      const userId = req.user.userId;
      const userRank = await gameScoreService.getUserRank(userId);

      if (!userRank) {
        return res.status(404).json({
          success: false,
          message: 'User not found in leaderboard. Play some games first!'
        });
      }

      res.status(200).json({
        success: true,
        data: userRank
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStats(req, res) {
    try {
      const stats = await gameScoreService.getLeaderboardStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Sample data creation removed to ensure only real user data is used
}

module.exports = new GameScoreController();