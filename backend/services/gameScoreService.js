const GameScore = require('../models/GameScore');
const User = require('../models/User');

class GameScoreService {
  // Record a new game score
  async recordGameScore(gameData) {
    try {
      const {
        userId,
        gameType = 'number_guessing',
        score,
        attempts,
        timeSpent,
        difficulty = 'medium',
        isWin,
        targetNumber,
        guessedNumber,
        hints = []
      } = gameData;

      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create new game score record
      const gameScore = await GameScore.create({
        userId,
        gameType,
        score,
        attempts,
        timeSpent,
        difficulty,
        isWin,
        targetNumber,
        guessedNumber,
        hints
      });

      return gameScore;
    } catch (error) {
      throw new Error(`Error recording game score: ${error.message}`);
    }
  }

  // Get user's game statistics
  async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const stats = await GameScore.getUserStats(userId);
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        stats
      };
    } catch (error) {
      throw new Error(`Error fetching user stats: ${error.message}`);
    }
  }

  // Get user's game history
  async getUserGameHistory(userId, page = 1, limit = 20) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const skip = (page - 1) * limit;
      const games = await GameScore.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await GameScore.countDocuments({ userId });

      return {
        games,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalGames: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error fetching game history: ${error.message}`);
    }
  }

  // Get global leaderboard
  async getLeaderboard(limit = 50) {
    try {
      const leaderboard = await GameScore.getLeaderboard(limit);
      return leaderboard;
    } catch (error) {
      throw new Error(`Error fetching leaderboard: ${error.message}`);
    }
  }

  // Get user's rank in leaderboard
  async getUserRank(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has played any games
      const userGamesCount = await GameScore.countDocuments({ userId });
      if (userGamesCount === 0) {
        return null; // User hasn't played any games yet
      }

      const leaderboard = await GameScore.getLeaderboard(1000); // Get more entries to find user
      const userIndex = leaderboard.findIndex(entry => entry.userId.toString() === userId.toString());
      
      if (userIndex === -1) {
        return null; // User not found in leaderboard (no games played)
      }

      return leaderboard[userIndex];
    } catch (error) {
      throw new Error(`Error fetching user rank: ${error.message}`);
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStats() {
    try {
      const totalPlayers = await GameScore.distinct('userId').then(users => users.length);
      const totalGames = await GameScore.countDocuments();
      const totalWins = await GameScore.countDocuments({ isWin: true });
      
      const topScore = await GameScore.findOne().sort({ score: -1 });
      const avgStats = await GameScore.aggregate([
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            avgAttempts: { $avg: '$attempts' },
            avgTime: { $avg: '$timeSpent' }
          }
        }
      ]);

      // Calculate global longest streak
      let globalLongestStreak = 0;
      const allUsers = await GameScore.distinct('userId');
      
      for (const userId of allUsers) {
        const games = await GameScore.find({ userId }).sort({ createdAt: 1 });
        let currentStreak = 0;
        let userLongestStreak = 0;

        games.forEach(game => {
          if (game.isWin) {
            currentStreak++;
            userLongestStreak = Math.max(userLongestStreak, currentStreak);
          } else {
            currentStreak = 0;
          }
        });

        globalLongestStreak = Math.max(globalLongestStreak, userLongestStreak);
      }

      return {
        totalPlayers,
        totalGames,
        totalWins,
        winRate: totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0,
        topScore: topScore ? topScore.score : 0,
        averageScore: avgStats.length > 0 ? Math.round(avgStats[0].avgScore) : 0,
        averageAttempts: avgStats.length > 0 ? Math.round(avgStats[0].avgAttempts * 10) / 10 : 0,
        averageTime: avgStats.length > 0 ? Math.round(avgStats[0].avgTime) : 0,
        longestStreak: globalLongestStreak
      };
    } catch (error) {
      throw new Error(`Error fetching leaderboard stats: ${error.message}`);
    }
  }

  // Sample data creation removed to ensure only real user data is used
}

module.exports = new GameScoreService();