import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTarget, FiZap, FiTrendingUp, FiRefreshCw, FiHome, FiArrowRight, FiCheck, FiX } = FiIcons;

const GamePage = () => {
  const { gameState, setGameState, startNewGame, makeGuess, resetGame } = useGame();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (gameState.gameStatus === 'idle') {
      startNewGame();
    }
  }, []);

  useEffect(() => {
    if (gameState.gameStatus === 'won') {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [gameState.gameStatus]);

  const handleSubmitGuess = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      makeGuess(inputValue);
      setInputValue('');
    }
  };

  const handleNewGame = () => {
    setInputValue('');
    startNewGame();
  };

  const getAttemptColor = (index) => {
    if (index < gameState.maxAttempts - gameState.attempts) {
      return 'bg-red-500';
    }
    return 'bg-slate-600';
  };

  const getFeedbackColor = () => {
    if (gameState.gameStatus === 'won') return 'text-green-400';
    if (gameState.gameStatus === 'lost') return 'text-red-400';
    if (gameState.feedback.includes('Too high') || gameState.feedback.includes('Too low')) {
      return 'text-yellow-400';
    }
    return 'text-blue-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Navbar />

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
            <SafeIcon icon={FiTarget} className="h-8 w-8 text-blue-400" />
            <span>Number Guessing Game</span>
          </h1>
          <p className="text-slate-300 text-lg">
            Can you guess the number between 1 and 20?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-8">
              {/* Game Status */}
              <div className="text-center mb-8">
                <motion.div
                  className={`text-2xl font-bold mb-4 ${getFeedbackColor()}`}
                  key={gameState.feedback}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {gameState.feedback || 'Make your first guess!'}
                </motion.div>

                {/* Attempts Remaining */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <span className="text-slate-300 mr-2">Attempts:</span>
                  {[...Array(gameState.maxAttempts)].map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${getAttemptColor(index)}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  ))}
                </div>
              </div>

              {/* Game Input */}
              {gameState.gameStatus === 'playing' && (
                <motion.form
                  onSubmit={handleSubmitGuess}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white text-center text-2xl font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter your guess (1-20)"
                      autoFocus
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={!inputValue || gameState.gameStatus !== 'playing'}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white py-4 rounded-xl font-semibold text-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Make Guess
                  </motion.button>
                </motion.form>
              )}

              {/* Game Over Actions */}
              {(gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <motion.button
                    onClick={handleNewGame}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <SafeIcon icon={FiRefreshCw} className="h-5 w-5" />
                    <span>Play Again</span>
                  </motion.button>
                  
                  <Link
                    to="/dashboard"
                    className="block w-full bg-slate-700 hover:bg-slate-600 text-white py-4 rounded-xl font-semibold text-lg transition-all text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <SafeIcon icon={FiHome} className="h-5 w-5" />
                      <span>Back to Dashboard</span>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Guess History */}
              {gameState.guessHistory.length > 0 && (
                <motion.div
                  className="mt-8 p-6 bg-slate-700/30 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <SafeIcon icon={FiTarget} className="h-5 w-5 text-blue-400" />
                    <span>Your Guesses</span>
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {gameState.guessHistory.map((guess, index) => (
                      <motion.div
                        key={index}
                        className="bg-slate-600 text-white p-3 rounded-lg text-center font-bold"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {guess.guess}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Stats Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-6">
              {/* Current Stats */}
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <SafeIcon icon={FiTrendingUp} className="h-5 w-5 text-green-400" />
                  <span>Your Stats</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Current Streak</span>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiZap} className="h-4 w-4 text-yellow-400" />
                      <span className="text-white font-bold">{user?.currentStreak || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Longest Streak</span>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiTrendingUp} className="h-4 w-4 text-green-400" />
                      <span className="text-white font-bold">{user?.longestStreak || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Total Wins</span>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiCheck} className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-bold">{user?.totalWins || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Total Games</span>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiTarget} className="h-4 w-4 text-purple-400" />
                      <span className="text-white font-bold">{user?.totalGames || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Tips */}
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">💡 Pro Tips</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Start with numbers around 10-11</li>
                  <li>• Use binary search strategy</li>
                  <li>• Pay attention to "too high" vs "too low"</li>
                  <li>• Build streaks for better rankings</li>
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/leaderboard"
                    className="block w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-all text-center"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <SafeIcon icon={FiTrendingUp} className="h-4 w-4" />
                      <span>View Leaderboard</span>
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GamePage;