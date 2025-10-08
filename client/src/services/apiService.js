import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
const apiService = {
  // User registration
  registerUser: async (userData) => {
    try {
      const response = await api.post('/user/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Get all users for history
  getAllUsers: async () => {
    try {
      const response = await api.get('/user/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Face recognition check-in
  checkin: async (imageData) => {
    try {
      const response = await api.post('/attendance/checkin', { image_data: imageData });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Get user attendance history
  getUserHistory: async (userId) => {
    try {
      const response = await api.get(`/attendance/history/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  // Debug endpoints
  debugUsers: async () => {
    try {
      const response = await api.get('/debug/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  },

  testRecognition: async (imageData) => {
    try {
      const response = await api.post('/debug/test_recognition', { image_data: imageData });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Network error' };
    }
  }
};

export default apiService;