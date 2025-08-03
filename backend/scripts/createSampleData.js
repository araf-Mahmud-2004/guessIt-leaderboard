const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const GameScore = require('../models/GameScore');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/backend_db');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const createSampleUsers = async () => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping user creation');
      return await User.find().limit(10);
    }

    const sampleUsers = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password123' },
      { name: 'Mike Johnson', email: 'mike@example.com', password: 'password123' },
      { name: 'Sarah Wilson', email: 'sarah@example.com', password: 'password123' },
      { name: 'David Brown', email: 'david@example.com', password: 'password123' },
      { name: 'Lisa Davis', email: 'lisa@example.com', password: 'password123' },
      { name: 'Tom Miller', email: 'tom@example.com', password: 'password123' },
      { name: 'Emma Garcia', email: 'emma@example.com', password: 'password123' },
      { name: 'Alex Rodriguez', email: 'alex@example.com', password: 'password123' },
      { name: 'Maria Martinez', email: 'maria@example.com', password: 'password123' }
    ];

    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword
      });
      users.push(user);
      console.log(`Created user: ${userData.name} (${userData.email})`);
    }

    return users;
  } catch (error) {
    console.error('Error creating sample users:', error.message);
    throw error;
  }
};

const createSampleGameScores = async (users) => {
  try {
    // Check if game scores already exist
    const existingGames = await GameScore.countDocuments();
    if (existingGames > 0) {
      console.log('Game scores already exist, skipping game score creation');
      return;
    }

    const sampleGames = [];
    const difficulties = ['easy', 'medium', 'hard'];

    // Create sample games for each user
    for (const user of users) {
      const numGames = Math.floor(Math.random() * 20) + 10; // 10-30 games per user
      
      for (let i = 0; i < numGames; i++) {
        const isWin = Math.random() > 0.3; // 70% win rate
        const attempts = Math.floor(Math.random() * 10) + 1;
        const timeSpent = Math.floor(Math.random() * 300) + 30; // 30-330 seconds
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const targetNumber = Math.floor(Math.random() * 20) + 1;
        const guessedNumber = isWin ? targetNumber : Math.floor(Math.random() * 20) + 1;
        
        // Calculate score based on performance
        let score = 0;
        if (isWin) {
          score = 100 + Math.max(0, (10 - attempts) * 10) + Math.max(0, (300 - timeSpent) / 10);
          const diffMultiplier = { easy: 1, medium: 1.5, hard: 2 };
          score *= diffMultiplier[difficulty];
          score = Math.round(score);
        }

        sampleGames.push({
          userId: user._id,
          gameType: 'number_guessing',
          score,
          attempts,
          timeSpent,
          difficulty,
          isWin,
          targetNumber,
          guessedNumber,
          hints: isWin ? [] : ['too high', 'too low'],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        });
      }
    }

    // Insert all sample games
    await GameScore.insertMany(sampleGames);
    console.log(`Created ${sampleGames.length} sample game scores`);
  } catch (error) {
    console.error('Error creating sample game scores:', error.message);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    
    console.log('Creating sample users...');
    const users = await createSampleUsers();
    
    console.log('Creating sample game scores...');
    await createSampleGameScores(users);
    
    console.log('Sample data creation completed successfully!');
    
    // Display some stats
    const totalUsers = await User.countDocuments();
    const totalGames = await GameScore.countDocuments();
    const totalWins = await GameScore.countDocuments({ isWin: true });
    
    console.log(`\nDatabase Stats:`);
    console.log(`- Total Users: ${totalUsers}`);
    console.log(`- Total Games: ${totalGames}`);
    console.log(`- Total Wins: ${totalWins}`);
    console.log(`- Win Rate: ${totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0}%`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error in main function:', error.message);
    process.exit(1);
  }
};

main();