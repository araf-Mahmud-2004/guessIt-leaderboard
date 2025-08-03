import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { gameAPI } from '../lib/api';

const { FiTarget, FiTrendingUp, FiAward, FiUsers, FiPlay, FiBarChart3, FiZap, FiStar } = FiIcons;

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cacheKey = `dashboard_${user._id || user.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);
        const now = Date.now();
        
        // Use cache if less than 2 minutes old
        if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 120000) {
          const parsed = JSON.parse(cachedData);
          setUserStats(parsed.userStats);
          setUserRank(parsed.userRank);
          setLeaderboardData(parsed.leaderboardData);
          setLoading(false);
          return;
        }

        // Fetch all data in parallel for better performance
        const [statsResult, rankResult, leaderboardResult] = await Promise.allSettled([
          gameAPI.getMyStats(),
          gameAPI.getMyRank(),
          gameAPI.getLeaderboard(5)
        ]);

        // Process stats
        if (statsResult.status === 'fulfilled' && statsResult.value.success) {
          setUserStats(statsResult.value.data.stats);
          // Update user context with real stats
          setUser(prev => ({
            ...prev,
            ...statsResult.value.data.stats
          }));
        }

        // Process rank
        if (rankResult.status === 'fulfilled' && rankResult.value.success) {
          setUserRank(rankResult.value.data);
        }

        // Process leaderboard
        if (leaderboardResult.status === 'fulfilled' && leaderboardResult.value.success) {
          setLeaderboardData(leaderboardResult.value.data);
        } else {
          // Fallback to mock data only if API completely fails
          const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
          const sortedUsers = mockUsers
            .sort((a, b) => (b.longestStreak || 0) - (a.longestStreak || 0))
            .slice(0, 5);
          setLeaderboardData(sortedUsers);
        }

        // Cache the results
        const dataToCache = {
          userStats: statsResult.status === 'fulfilled' && statsResult.value.success ? statsResult.value.data.stats : null,
          userRank: rankResult.status === 'fulfilled' && rankResult.value.success ? rankResult.value.data : null,
          leaderboardData: leaderboardResult.status === 'fulfilled' && leaderboardResult.value.success ? leaderboardResult.value.data : []
        };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        localStorage.setItem(`${cacheKey}_time`, now.toString());

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?._id || user?.id]); // Only depend on user ID to prevent unnecessary re-fetches

  // Use real stats data, fallback to user context, then to 0
  const currentStats = userStats || user || {};
  
  const stats = [
    {
      label: 'Current Streak',
      value: currentStats.longestStreak || 0, // Note: Backend doesn't track current streak, using longest for now
      icon: FiZap,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    },
    {
      label: 'Longest Streak',
      value: currentStats.longestStreak || 0,
      icon: FiTrendingUp,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      label: 'Total Games',
      value: currentStats.totalGames || 0,
      icon: FiTarget,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      label: 'Total Wins',
      value: currentStats.totalWins || 0,
      icon: FiAward,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  const winRate = currentStats.totalGames > 0 ? Math.round((currentStats.totalWins / currentStats.totalGames) * 100) : 0;

  // Progressive loading - show skeleton instead of blank screen
  const isInitialLoad = loading && !userStats && !userRank && leaderboardData.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <motion.div
            className="mb-6 bg-red-600/20 border border-red-500/30 rounded-xl p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-red-300 text-center">{error}</p>
          </motion.div>
        )}
        {/* Welcome Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-slate-300 text-lg">
            Ready to continue your guessing journey? Let's see how you're doing!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-lg rounded-xl p-6 hover:scale-105 transition-all duration-300`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-lg`}>
                  <SafeIcon icon={stat.icon} className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <SafeIcon icon={FiPlay} className="h-6 w-6 text-blue-400" />
                <span>Quick Actions</span>
              </h2>
              
              <div className="space-y-4">
                {/* Start New Game */}
                <Link
                  to="/game"
                  className="block"
                >
                  <motion.div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Start New Game</h3>
                        <p className="text-blue-100">Test your guessing skills and build your streak!</p>
                      </div>
                      <SafeIcon icon={FiTarget} className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                </Link>

                {/* View Leaderboard */}
                <Link
                  to="/leaderboard"
                  className="block"
                >
                  <motion.div
                    className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-slate-500 rounded-xl p-6 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">View Leaderboard</h3>
                        <p className="text-slate-300">See how you rank against other players</p>
                      </div>
                      <SafeIcon icon={FiTrendingUp} className="h-8 w-8 text-green-400" />
                    </div>
                  </motion.div>
                </Link>
              </div>

              {/* Performance Overview */}
              <div className="mt-8 p-6 bg-slate-700/30 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <SafeIcon icon={FiBarChart3} className="h-5 w-5 text-blue-400" />
                  <span>Performance Overview</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">{winRate}%</div>
                    <div className="text-sm text-slate-300">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      #{userRank?.rank || currentStats.totalGames > 0 ? '...' : 'N/A'}
                    </div>
                    <div className="text-sm text-slate-300">Global Rank</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-slate-300 mb-2">
                    <span>Win Rate Progress</span>
                    <span>{winRate}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${winRate}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Top Players Preview */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <SafeIcon icon={FiUsers} className="h-5 w-5 text-yellow-400" />
                <span>Top Players</span>
              </h2>

              <div className="space-y-4">
                {leaderboardData.slice(0, 5).map((player, index) => (
                  <motion.div
                    key={player.userId || player.id}
                    className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-slate-400' : 
                      index === 2 ? 'bg-amber-600' : 'bg-slate-600'
                    }`}>
                      {index < 3 ? (
                        <SafeIcon icon={FiStar} className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-white text-sm font-bold">{player.rank || index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">
                        {player.name || player.email?.split('@')[0] || 'Unknown Player'}
                      </div>
                      <div className="text-slate-400 text-xs">
                        {player.longestStreak || 0} streak • {player.totalWins || 0} wins
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link
                to="/leaderboard"
                className="block mt-4 text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View Full Leaderboard →
              </Link>
            </div>

            {/* Motivational Card */}
            <motion.div
              className="mt-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="text-center">
                <SafeIcon icon={FiZap} className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Keep It Up!</h3>
                <p className="text-slate-300 text-sm">
                  {currentStats.longestStreak > 0 
                    ? `Your best streak is ${currentStats.longestStreak} games! Can you beat it?`
                    : "Start a new game and begin building your streak!"
                  }
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;