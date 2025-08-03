import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiTarget, FiTrendingUp, FiUsers, FiZap, FiStar, FiAward } = FiIcons;

const LandingPage = () => {
  const features = [
    {
      icon: FiTarget,
      title: 'Simple Gameplay',
      description: 'Guess numbers between 1-20 in just 5 attempts!'
    },
    {
      icon: FiTrendingUp,
      title: 'Track Progress',
      description: 'Monitor your win streaks and climbing rankings'
    },
    {
      icon: FiUsers,
      title: 'Global Leaderboard',
      description: 'Compete with players worldwide for the top spot'
    },
    {
      icon: FiZap,
      title: 'Quick Games',
      description: 'Perfect for quick breaks and casual gaming'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <motion.header
        className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <SafeIcon icon={FiTarget} className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">GuessIt</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Guess the Number &
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  {' '}Climb the Leaderboard!
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
                Test your intuition in this addictive number guessing game. 
                Build win streaks, compete globally, and prove you're the ultimate guesser!
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Start Playing Now
              </Link>
              <Link
                to="/login"
                className="border-2 border-slate-600 hover:border-slate-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:bg-slate-800"
              >
                Already have an account?
              </Link>
            </motion.div>
          </div>

          {/* Floating Game Preview */}
          <motion.div
            className="mt-20 relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Game Preview</h3>
                <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                  <p className="text-slate-300">Guess a number between 1 and 20!</p>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <input
                      type="number"
                      placeholder="Enter your guess..."
                      className="w-full bg-transparent text-white text-center text-xl outline-none"
                      disabled
                    />
                  </div>
                  <div className="text-sm text-slate-400">5 attempts remaining</div>
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose GuessIt?</h2>
            <p className="text-xl text-slate-300">Experience the perfect blend of simplicity and competition</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-700/50 transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg w-fit mx-auto mb-4">
                  <SafeIcon icon={feature.icon} className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-16">Join the Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-400 mb-2">1,000+</div>
                <div className="text-xl text-slate-300">Players</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-400 mb-2">50K+</div>
                <div className="text-xl text-slate-300">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">15</div>
                <div className="text-xl text-slate-300">Longest Streak</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Guessing?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of players and start building your win streak today!
            </p>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
            >
              <SafeIcon icon={FiStar} className="h-5 w-5" />
              <span>Get Started Free</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <SafeIcon icon={FiTarget} className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">GuessIt</span>
            </div>
            <div className="text-slate-400 text-center md:text-right">
              <p>&copy; 2024 GuessIt. All rights reserved.</p>
              <p className="text-sm mt-1">Built with passion for number guessing enthusiasts</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;