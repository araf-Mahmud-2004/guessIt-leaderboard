import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to mock authentication if API fails
      try {
        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);
        
        if (!foundUser) {
          throw new Error('Invalid credentials');
        }

        const token = 'mock-jwt-token-' + Date.now();
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          currentStreak: foundUser.currentStreak || 0,
          longestStreak: foundUser.longestStreak || 0,
          totalGames: foundUser.totalGames || 0,
          totalWins: foundUser.totalWins || 0,
          rank: foundUser.rank || 999
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return { success: true };
      } catch (mockError) {
        return { success: false, error: error.message || 'Login failed' };
      }
    }
  };

  const signup = async (name, email, password) => {
    try {
      console.log('Attempting signup with:', { name, email });
      const response = await authAPI.signup(name, email, password);
      console.log('Signup API response:', response);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        console.log('Signup successful, storing user data:', userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Return the actual error instead of falling back to mock data
      // This ensures we can see what's actually going wrong
      return { success: false, error: error.message || 'Signup failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUserStats = (newStats) => {
    const updatedUser = { ...user, ...newStats };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Update in mock database
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const userIndex = mockUsers.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...newStats };
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    }
  };

  const value = {
    user,
    setUser,
    login,
    signup,
    logout,
    updateUserStats,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};