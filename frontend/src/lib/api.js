// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (name, email, password) => {
    return makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  logout: async () => {
    return makeRequest('/auth/logout', {
      method: 'POST',
    });
  },

  forgotPassword: async (email) => {
    return makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, password) => {
    return makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    return makeRequest('/users/profile');
  },

  updateProfile: async (userData) => {
    return makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteAccount: async () => {
    return makeRequest('/users/profile', {
      method: 'DELETE',
    });
  },
};

// Game Score API
export const gameAPI = {
  // Record a new game score
  recordScore: async (gameData) => {
    return makeRequest('/games/record', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  },

  // Get current user's statistics
  getMyStats: async () => {
    return makeRequest('/games/my-stats');
  },

  // Get current user's game history
  getMyGameHistory: async (page = 1, limit = 20) => {
    return makeRequest(`/games/my-history?page=${page}&limit=${limit}`);
  },

  // Get current user's rank
  getMyRank: async () => {
    return makeRequest('/games/my-rank');
  },

  // Get global leaderboard
  getLeaderboard: async (limit = 50) => {
    return makeRequest(`/games/leaderboard?limit=${limit}`);
  },

  // Get leaderboard statistics
  getLeaderboardStats: async () => {
    return makeRequest('/games/leaderboard/stats');
  },

  // Get public statistics (no auth required)
  getPublicStats: async () => {
    const response = await fetch(`${API_BASE_URL}/games/leaderboard/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  // Sample data creation removed to ensure only real user data is used
};

// Export default API object
const api = {
  auth: authAPI,
  user: userAPI,
  game: gameAPI,
};

export default api;