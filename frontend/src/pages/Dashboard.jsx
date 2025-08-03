import React, { useEffect, useState, useMemo } from 'react';
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
    const fetchDashboardData = async (forceRefresh = false) => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const cacheKey = `dashboard_${user._id || user.id}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(`${cacheKey}_time`);
        const lastGameTime = localStorage.getItem('lastGameTime');
        const now = Date.now();
        
        // Check if user played a game recently (within last 30 seconds)
        const recentGamePlayed = lastGameTime && (now - parseInt(lastGameTime)) < 30000;
        
        // Use cache only if:
        // 1. Not forced refresh
        // 2. Cache exists and is less than 30 seconds old (reduced from 2 minutes)
        // 3. No recent game was played
        const shouldUseCache = !forceRefresh && 
                              cachedData && 
                              cacheTime && 
                              (now - parseInt(cacheTime)) < 30000 && 
                              !recentGamePlayed;

        if (shouldUseCache) {
          const parsed = JSON.parse(cachedData);
          if (parsed.userStats) setUserStats(parsed.userStats);
          if (parsed.userRank) setUserRank(parsed.userRank);
          if (parsed.leaderboardData) setLeaderboardData(parsed.leaderboardData);
          setLoading(false);
          return;
        }

        // Clear recent game flag since we're refreshing
        if (recentGamePlayed) {
          localStorage.removeItem('lastGameTime');
        }

        // Fetch all data in parallel for better performance
        const [statsResult, rankResult, leaderboardResult] = await Promise.allSettled([
          gameAPI.getMyStats(),
          gameAPI.getMyRank(),
          gameAPI.getLeaderboard(5)
        ]);

        // Process results
        let newUserStats = null;
        let newUserRank = null;
        let newLeaderboardData = [];

        if (statsResult.status === 'fulfilled' && statsResult.value.success) {
          newUserStats = statsResult.value.data.stats;
          setUserStats(newUserStats);
          setUser(prev => ({ ...prev, ...newUserStats }));
        }

        if (rankResult.status === 'fulfilled' && rankResult.value.success) {
          newUserRank = rankResult.value.data;
          setUserRank(newUserRank);
        }

        if (leaderboardResult.status === 'fulfilled' && leaderboardResult.value.success) {
          newLeaderboardData = leaderboardResult.value.data;
          setLeaderboardData(newLeaderboardData);
        }

        // Cache the results with shorter expiry
        const dataToCache = {
          userStats: newUserStats,
          userRank: newUserRank,
          leaderboardData: newLeaderboardData
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

    // Auto-refresh when user becomes visible (returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to tab, check if we should refresh
        const lastGameTime = localStorage.getItem('lastGameTime');
        const now = Date.now();
        
        // If a game was played recently, force refresh
        if (lastGameTime && (now - parseInt(lastGameTime)) < 60000) {
          fetchDashboardData(true);
        }
      }
    };

    // Auto-refresh when window gains focus
    const handleFocus = () => {
      const lastGameTime = localStorage.getItem('lastGameTime');
      const now = Date.now();
      
      // If a game was played recently, force refresh
      if (lastGameTime && (now - parseInt(lastGameTime)) < 60000) {
        fetchDashboardData(true);
      }
    };

    // Listen for visibility and focus changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Cleanup listeners
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?._id || user?.id]);

  // Memoize computed values to prevent unnecessary re-calculations
  const currentStats = useMemo(() => userStats || user || {}, [userStats, user]);
  
  const stats = useMemo(() => [
    {
      label: 'Current Streak',
      value: currentStats.longestStreak || 0,
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
  ], [currentStats]);

  const winRate = useMemo(() => 
    currentStats.totalGames > 0 ? Math.round((currentStats.totalWins / currentStats.totalGames) * 100) : 0,
    [currentStats.totalGames, currentStats.totalWins]
  );

  // Skeleton loading component
  const SkeletonCard = ({ className = "" }) => (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-8 bg-slate-700 rounded w-16 animate-pulse"></div>
        </div>
        <div className="w-12 h-12 bg-slate-700 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );

  // Show skeleton for initial load
  if (loading && !userStats && !userRank && leaderboardData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-slate-700 rounded w-96 mb-2 animate-pulse"></div>
            <div className="h-6 bg-slate-700 rounded w-80 animate-pulse"></div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="h-6 bg-slate-700 rounded w-32 mb-6 animate-pulse"></div>
                <div className="space-y-4">
                  <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="h-6 bg-slate-700 rounded w-24 mb-6 animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-600/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-300 text-center">{error}</p>
          </div>
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
              className={`${stat.bgColor} ${stat.borderColor} border backdrop-blur-lg rounded-xl p-6 hover:scale-105 transition-transform duration-200`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">
                    {loading && !userStats ? (
                      <div className="h-8 bg-slate-700 rounded w-16 animate-pulse"></div>
                    ) : (
                      stat.value
                    )}
                  </p>
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
                <Link to="/game" className="block">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-6 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Start New Game</h3>
                        <p className="text-blue-100">Test your guessing skills and build your streak!</p>
                      </div>
                      <SafeIcon icon={FiTarget} className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </Link>

                {/* View Leaderboard */}
                <Link to="/leaderboard" className="block">
                  <div className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-slate-500 rounded-xl p-6 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">View Leaderboard</h3>
                        <p className="text-slate-300">See how you rank against other players</p>
                      </div>
                      <SafeIcon icon={FiTrendingUp} className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
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
                      {loading && !userRank ? (
                        <div className="h-8 bg-slate-700 rounded w-12 mx-auto animate-pulse"></div>
                      ) : (
                        `#${userRank?.rank || (currentStats.totalGames > 0 ? '...' : 'N/A')}`
                      )}
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
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${winRate}%` }}
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
                {loading && leaderboardData.length === 0 ? (
                  // Skeleton for leaderboard
                  [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="w-8 h-8 bg-slate-600 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-600 rounded w-20 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-slate-600 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  leaderboardData.slice(0, 5).map((player, index) => (
                    <div
                      key={player.userId || player.id}
                      className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg"
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
                    </div>
                  ))
                )}
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