const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('retaincurve_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth
  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Learning Entries (Aaj Kya Padha)
  createLearningEntry: async ({ subject, topic, learnedDate, notes, intervals }) => {
    const res = await fetch(`${API_BASE_URL}/learning`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ subject, topic, learnedDate, notes, intervals }),
    });
    return res.json();
  },

  getLearningHistory: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '' && params[k] !== 'undefined') {
        cleanParams[k] = params[k];
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE_URL}/learning?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  deleteLearningEntry: async (id) => {
    const res = await fetch(`${API_BASE_URL}/learning/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Todos (Revision todos by forgetting curve)
  getTodayTodos: async () => {
    const res = await fetch(`${API_BASE_URL}/todos/today`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  completeTodo: async (id) => {
    const res = await fetch(`${API_BASE_URL}/todos/${id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  uncompleteTodo: async (id) => {
    const res = await fetch(`${API_BASE_URL}/todos/${id}/uncomplete`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  getTodoHistory: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '' && params[k] !== 'undefined') {
        cleanParams[k] = params[k];
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE_URL}/todos/history?${query}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  markAsRead: async (id) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  markAllAsRead: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  triggerManualNotificationCheck: async () => {
    const res = await fetch(`${API_BASE_URL}/notifications/trigger-check`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },
};
