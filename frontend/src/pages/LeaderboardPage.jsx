import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { gameAPI } from '../lib/api';

const { FiTrendingUp, FiUsers, FiStar, FiAward, FiTarget, FiHome, FiMedal, FiCrown } = FiIcons;

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch leaderboard data
        const leaderboardResponse = await gameAPI.getLeaderboard(50);
        setLeaderboardData(leaderboardResponse.data || []);

        // Fetch leaderboard stats
        const statsResponse = await gameAPI.getLeaderboardStats();
        setLeaderboardStats(statsResponse.data);

        // Fetch current user's rank if logged in
        if (user) {
          try {
            const rankResponse = await gameAPI.getMyRank();
            setUserRank(rankResponse.data);
          } catch (rankError) {
            // User might not have played any games yet
            console.log('User rank not found:', rankError.message);
            setUserRank(null);
          }
        }
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError(err.message);
        
        // Fallback to mock data if API fails
        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        if (mockUsers.length > 0) {
          const sortedUsers = mockUsers
            .sort((a, b) => {
              const aStreak = a.longestStreak || 0;
              const bStreak = b.longestStreak || 0;
              if (bStreak !== aStreak) return bStreak - aStreak;
              return (b.totalWins || 0) - (a.totalWins || 0);
            })
            .map((user, index) => ({ ...user, rank: index + 1 }));
          setLeaderboardData(sortedUsers);
          
          if (user) {
            const currentUserIndex = sortedUsers.findIndex(u => u.id === user.id);
            if (currentUserIndex !== -1) {
              setUserRank(sortedUsers[currentUserIndex]);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [user]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return { icon: FiCrown, color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 2:
        return { icon: FiMedal, color: 'text-slate-300', bg: 'bg-slate-500/20' };
      case 3:
        return { icon: FiAward, color: 'text-amber-600', bg: 'bg-amber-600/20' };
      default:
        return { icon: FiStar, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    }
  };

  const getWinRate = (user) => {
    if (!user.totalGames || user.totalGames === 0) return 0;
    return user.winRate || Math.round((user.totalWins / user.totalGames) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading leaderboard...</p>
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
          <motion.div
            className="mb-6 bg-red-600/20 border border-red-500/30 rounded-xl p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-red-300 text-center">
              {error}. Showing cached data if available.
            </p>
          </motion.div>
        )}
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
            <SafeIcon icon={FiTrendingUp} className="h-8 w-8 text-yellow-400" />
            <span>Global Leaderboard</span>
          </h1>
          <p className="text-slate-300 text-lg">
            See how you rank against the best guessers worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Leaderboard Table */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <SafeIcon icon={FiUsers} className="h-6 w-6 text-blue-400" />
                  <span>Top Players</span>
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Longest Streak
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Win Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Total Wins
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {leaderboardData.slice(0, 20).map((player, index) => {
                      const rankInfo = getRankIcon(player.rank);
                      const isCurrentUser = user && player.id === user.id;
                      
                      return (
                        <motion.tr
                          key={player.id}
                          className={`hover:bg-slate-700/30 transition-colors ${
                            isCurrentUser ? 'bg-blue-600/20 border-l-4 border-blue-500' : ''
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-lg ${rankInfo.bg}`}>
                                <SafeIcon icon={rankInfo.icon} className={`h-4 w-4 ${rankInfo.color}`} />
                              </div>
                              <span className="text-white font-bold">#{player.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {(player.name || player.email).charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className={`text-sm font-medium ${isCurrentUser ? 'text-blue-300' : 'text-white'}`}>
                                  {player.name || player.email.split('@')[0]}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-400">{player.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={FiTrendingUp} className="h-4 w-4 text-green-400" />
                              <span className="text-2xl font-bold text-white">
                                {player.longestStreak || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-semibold text-white">
                                {getWinRate(player)}%
                              </span>
                              <div className="w-16 bg-slate-600 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                                  style={{ width: `${getWinRate(player)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <SafeIcon icon={FiTarget} className="h-4 w-4 text-blue-400" />
                              <span className="text-lg font-semibold text-white">
                                {player.totalWins || 0}
                              </span>
                              <span className="text-sm text-slate-400">
                                / {player.totalGames || 0}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* User Stats Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-6">
              {/* User Rank Card */}
              {userRank && (
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <SafeIcon icon={FiStar} className="h-5 w-5 text-yellow-400" />
                    <span>Your Ranking</span>
                  </h3>
                  
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`p-3 rounded-xl ${getRankIcon(userRank.rank).bg}`}>
                        <SafeIcon 
                          icon={getRankIcon(userRank.rank).icon} 
                          className={`h-6 w-6 ${getRankIcon(userRank.rank).color}`} 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-3xl font-bold text-white mb-1">
                        #{userRank.rank}
                      </div>
                      <div className="text-slate-300">Global Rank</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">
                          {userRank.longestStreak || 0}
                        </div>
                        <div className="text-xs text-slate-400">Best Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">
                          {getWinRate(userRank)}%
                        </div>
                        <div className="text-xs text-slate-400">Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Stats */}
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Leaderboard Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Total Players</span>
                    <span className="text-white font-bold">
                      {leaderboardStats?.totalPlayers || leaderboardData.length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Total Games</span>
                    <span className="text-blue-400 font-bold">
                      {leaderboardStats?.totalGames || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Top Streak</span>
                    <span className="text-green-400 font-bold">
                      {leaderboardData[0]?.longestStreak || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Avg. Win Rate</span>
                    <span className="text-purple-400 font-bold">
                      {leaderboardStats?.averageWinRate || 
                        (leaderboardData.length > 0 
                          ? Math.round(leaderboardData.reduce((acc, user) => acc + getWinRate(user), 0) / leaderboardData.length)
                          : 0
                        )
                      }%
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/game"
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <SafeIcon icon={FiTarget} className="h-4 w-4" />
                      <span>Play Game</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/dashboard"
                    className="block w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-all text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <SafeIcon icon={FiHome} className="h-4 w-4" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Achievement Hint */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                  <SafeIcon icon={FiAward} className="h-5 w-5 text-yellow-400" />
                  <span>Climb Higher!</span>
                </h3>
                <p className="text-slate-300 text-sm">
                  Build longer win streaks to climb the leaderboard. Every correct guess counts!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;