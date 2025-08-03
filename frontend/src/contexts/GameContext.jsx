import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { gameAPI } from '../lib/api';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { user, updateUserStats } = useAuth();
  const [gameState, setGameState] = useState({
    targetNumber: null,
    currentGuess: '',
    attempts: 5,
    maxAttempts: 5,
    gameStatus: 'idle', // idle, playing, won, lost
    feedback: '',
    guessHistory: [],
    startTime: null,
    difficulty: 'medium'
  });

  const startNewGame = () => {
    const targetNumber = Math.floor(Math.random() * 20) + 1;
    setGameState({
      targetNumber,
      currentGuess: '',
      attempts: 5,
      maxAttempts: 5,
      gameStatus: 'playing',
      feedback: 'Guess a number between 1 and 20!',
      guessHistory: [],
      startTime: Date.now(),
      difficulty: 'medium'
    });
  };

  // Function to record game score to database
  const recordGameScore = async (isWin, finalGuess) => {
    if (!user || !gameState.startTime) return;

    try {
      const timeSpent = Math.round((Date.now() - gameState.startTime) / 1000); // in seconds
      const attemptsUsed = gameState.maxAttempts - gameState.attempts + (isWin ? 1 : 0);
      
      const gameData = {
        gameType: 'number_guessing',
        score: isWin ? Math.max(0, 100 - (attemptsUsed - 1) * 10 - Math.floor(timeSpent / 10)) : 0,
        attempts: attemptsUsed,
        timeSpent: timeSpent,
        difficulty: gameState.difficulty,
        isWin: isWin,
        targetNumber: gameState.targetNumber,
        guessedNumber: finalGuess,
        hints: gameState.guessHistory.map(h => `Attempt ${h.attempt}: ${h.guess}`)
      };

      await gameAPI.recordScore(gameData);
      console.log('Game score recorded successfully');
      
      // Set timestamp for dashboard auto-refresh
      localStorage.setItem('lastGameTime', Date.now().toString());
    } catch (error) {
      console.error('Failed to record game score:', error);
      // Continue with local stats update even if API fails
    }
  };

  const makeGuess = async (guess) => {
    if (gameState.gameStatus !== 'playing' || gameState.attempts <= 0) return;

    const numGuess = parseInt(guess);
    if (isNaN(numGuess) || numGuess < 1 || numGuess > 20) {
      setGameState(prev => ({
        ...prev,
        feedback: 'Please enter a number between 1 and 20!'
      }));
      return;
    }

    const newAttempts = gameState.attempts - 1;
    const newHistory = [...gameState.guessHistory, { guess: numGuess, attempt: gameState.maxAttempts - newAttempts }];
    
    let feedback = '';
    let status = 'playing';

    if (numGuess === gameState.targetNumber) {
      feedback = `🎉 Correct! You won in ${gameState.maxAttempts - newAttempts} attempts!`;
      status = 'won';
      
      // Record game score to database
      await recordGameScore(true, numGuess);
      
      // Update user stats for win
      if (user) {
        const newCurrentStreak = user.currentStreak + 1;
        const newLongestStreak = Math.max(user.longestStreak, newCurrentStreak);
        updateUserStats({
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          totalGames: user.totalGames + 1,
          totalWins: user.totalWins + 1
        });
      }
    } else if (newAttempts === 0) {
      feedback = `😞 Game over! The number was ${gameState.targetNumber}.`;
      status = 'lost';
      
      // Record game score to database
      await recordGameScore(false, numGuess);
      
      // Update user stats for loss
      if (user) {
        updateUserStats({
          currentStreak: 0,
          totalGames: user.totalGames + 1
        });
      }
    } else {
      feedback = numGuess > gameState.targetNumber 
        ? `Too high! ${newAttempts} attempts left.`
        : `Too low! ${newAttempts} attempts left.`;
    }

    setGameState(prev => ({
      ...prev,
      attempts: newAttempts,
      gameStatus: status,
      feedback,
      guessHistory: newHistory,
      currentGuess: ''
    }));
  };

  const resetGame = () => {
    setGameState({
      targetNumber: null,
      currentGuess: '',
      attempts: 5,
      maxAttempts: 5,
      gameStatus: 'idle',
      feedback: '',
      guessHistory: [],
      startTime: null,
      difficulty: 'medium'
    });
  };

  const value = {
    gameState,
    setGameState,
    startNewGame,
    makeGuess,
    resetGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};