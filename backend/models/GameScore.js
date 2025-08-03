const mongoose = require('mongoose');

const gameScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    enum: ['number_guessing', 'word_guessing', 'general'],
    default: 'number_guessing'
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  attempts: {
    type: Number,
    required: true,
    min: 1
  },
  timeSpent: {
    type: Number, // in seconds
    required: true,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isWin: {
    type: Boolean,
    required: true
  },
  targetNumber: {
    type: Number,
    required: false // Only for number guessing games
  },
  guessedNumber: {
    type: Number,
    required: false // Only for number guessing games
  },
  hints: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
gameScoreSchema.index({ userId: 1, createdAt: -1 });
gameScoreSchema.index({ score: -1 });
gameScoreSchema.index({ isWin: 1, userId: 1 });

// Virtual for calculating points based on performance
gameScoreSchema.virtual('points').get(function() {
  let points = 0;
  
  if (this.isWin) {
    // Base points for winning
    points += 100;
    
    // Bonus for fewer attempts
    const maxAttempts = 10;
    const attemptBonus = Math.max(0, (maxAttempts - this.attempts) * 10);
    points += attemptBonus;
    
    // Bonus for speed (less time = more points)
    const maxTime = 300; // 5 minutes
    const timeBonus = Math.max(0, (maxTime - this.timeSpent) / 10);
    points += Math.round(timeBonus);
    
    // Difficulty multiplier
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2
    };
    points *= difficultyMultiplier[this.difficulty] || 1;
  }
  
  return Math.round(points);
});

// Static method to get user statistics
gameScoreSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$userId',
        totalGames: { $sum: 1 },
        totalWins: { $sum: { $cond: ['$isWin', 1, 0] } },
        totalScore: { $sum: '$score' },
        averageAttempts: { $avg: '$attempts' },
        averageTime: { $avg: '$timeSpent' },
        bestScore: { $max: '$score' },
        recentGames: { $push: '$$ROOT' }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalGames: 0,
      totalWins: 0,
      totalScore: 0,
      winRate: 0,
      averageAttempts: 0,
      averageTime: 0,
      bestScore: 0,
      longestStreak: 0
    };
  }

  const userStats = stats[0];
  const winRate = userStats.totalGames > 0 ? (userStats.totalWins / userStats.totalGames) * 100 : 0;

  // Calculate longest winning streak
  const games = await this.find({ userId }).sort({ createdAt: 1 });
  let longestStreak = 0;
  let currentStreak = 0;

  games.forEach(game => {
    if (game.isWin) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return {
    totalGames: userStats.totalGames,
    totalWins: userStats.totalWins,
    totalScore: userStats.totalScore,
    winRate: Math.round(winRate),
    averageAttempts: Math.round(userStats.averageAttempts * 10) / 10,
    averageTime: Math.round(userStats.averageTime),
    bestScore: userStats.bestScore,
    longestStreak
  };
};

// Static method to get leaderboard
gameScoreSchema.statics.getLeaderboard = async function(limit = 50) {
  const leaderboard = await this.aggregate([
    {
      $group: {
        _id: '$userId',
        totalGames: { $sum: 1 },
        totalWins: { $sum: { $cond: ['$isWin', 1, 0] } },
        totalScore: { $sum: '$score' },
        bestScore: { $max: '$score' },
        averageAttempts: { $avg: '$attempts' },
        lastPlayed: { $max: '$createdAt' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $addFields: {
        winRate: {
          $cond: [
            { $gt: ['$totalGames', 0] },
            { $multiply: [{ $divide: ['$totalWins', '$totalGames'] }, 100] },
            0
          ]
        }
      }
    },
    {
      $sort: { bestScore: -1, totalWins: -1, winRate: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        totalGames: 1,
        totalWins: 1,
        totalScore: 1,
        bestScore: 1,
        winRate: { $round: ['$winRate', 1] },
        averageAttempts: { $round: ['$averageAttempts', 1] },
        lastPlayed: 1
      }
    }
  ]);

  // Calculate longest streaks for each user
  for (let i = 0; i < leaderboard.length; i++) {
    const userId = leaderboard[i].userId;
    const games = await this.find({ userId }).sort({ createdAt: 1 });
    
    let longestStreak = 0;
    let currentStreak = 0;

    games.forEach(game => {
      if (game.isWin) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    leaderboard[i].longestStreak = longestStreak;
  }

  // Re-sort by longest streak, then by total wins
  leaderboard.sort((a, b) => {
    if (b.longestStreak !== a.longestStreak) {
      return b.longestStreak - a.longestStreak;
    }
    return b.totalWins - a.totalWins;
  });

  // Add rank
  leaderboard.forEach((user, index) => {
    user.rank = index + 1;
  });

  return leaderboard;
};

module.exports = mongoose.model('GameScore', gameScoreSchema);