const express = require('express');
const router = express.Router();
const gameScoreController = require('../controllers/gameScoreController');
const { protect } = require('../middleware/auth');
const { publicGameLimiter } = require('../middleware/rateLimiter');
const { body } = require('express-validator');

// Validation middleware for recording game scores
const validateGameScore = [
  body('gameType')
    .isIn(['number_guessing', 'word_guessing', 'general'])
    .withMessage('Game type must be one of: number_guessing, word_guessing, general'),
  body('score')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Score must be a non-negative number'),
  body('attempts')
    .isInt({ min: 1 })
    .withMessage('Attempts must be a positive integer'),
  body('timeSpent')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Time spent must be a non-negative number'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be one of: easy, medium, hard'),
  body('isWin')
    .isBoolean()
    .withMessage('isWin must be a boolean value'),
  body('targetNumber')
    .optional()
    .isNumeric()
    .withMessage('Target number must be numeric'),
  body('guessedNumber')
    .optional()
    .isNumeric()
    .withMessage('Guessed number must be numeric'),
  body('hints')
    .optional()
    .isArray()
    .withMessage('Hints must be an array')
];

// Public routes (no authentication required) - with lenient rate limiting
router.get('/leaderboard', publicGameLimiter, gameScoreController.getLeaderboard);
router.get('/leaderboard/stats', publicGameLimiter, gameScoreController.getLeaderboardStats);

// Protected routes (authentication required)
router.use(protect); // Apply auth middleware to all routes below

// User's own game data
router.post('/record', validateGameScore, gameScoreController.recordScore);
router.get('/my-stats', gameScoreController.getMyStats);
router.get('/my-history', gameScoreController.getMyGameHistory);
router.get('/my-rank', gameScoreController.getMyRank);

// Admin routes for accessing other users' data
router.get('/user/:userId/stats', gameScoreController.getUserStats);
router.get('/user/:userId/history', gameScoreController.getUserGameHistory);

// Sample data creation removed to ensure only real user data is used

module.exports = router;