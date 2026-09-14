/**
 * API Service for RetainCurve
 * Automatically normalizes backend URL and handles errors gracefully
 */

export const getBaseUrl = () => {
  let raw = '';
  if (typeof window !== 'undefined') {
    raw = localStorage.getItem('retaincurve_api_url') || '';
  }
  if (!raw) {
    raw = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  }
  if (!raw) {
    raw = 'http://localhost:5000/api';
  }

  // Normalize: remove whitespace & trailing slashes
  let clean = raw.trim().replace(/\/+$/, '');

  // Auto append /api if omitted
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }
  return clean;
};

export const setCustomApiUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url) {
      localStorage.setItem('retaincurve_api_url', url.trim());
    } else {
      localStorage.removeItem('retaincurve_api_url');
    }
  }
};

const getHeaders = (extraHeaders = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('retaincurve_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
};

const request = async (endpoint, options = {}) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: getHeaders(options.headers),
    });

    const contentType = res.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: res.ok, message: text || `HTTP ${res.status} ${res.statusText}` };
      }
    }

    if (!res.ok && data.success === undefined) {
      data.success = false;
    }
    return data;
  } catch (err) {
    console.error(`[API Network Error] URL: ${url}`, err);

    let friendlyMessage = 'Unable to connect to backend server.';
    const isRender = baseUrl.includes('onrender.com');
    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
    const isProductionHost = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

    if (isProductionHost && isLocalhost) {
      friendlyMessage = 'Frontend production me chal raha hai par API URL localhost par set hai! Vercel/Netlify me VITE_API_URL set karein.';
    } else if (isRender) {
      friendlyMessage = 'Render free tier backend so raha tha (cold start). Kripya 30-45 second wait karke dobara try karein!';
    } else {
      friendlyMessage = `Server se connect nahi ho pa raha (${err.message || 'Failed to fetch'}). Kripya internet ya server status check karein.`;
    }

    return {
      success: false,
      message: friendlyMessage,
      networkError: true,
      error: err.message,
    };
  }
};

export const api = {
  // Auth
  register: async (name, email, password) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async () => {
    return request('/auth/profile', { method: 'GET' });
  },

  updateProfile: async (data) => {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Learning Entries (Aaj Kya Padha)
  createLearningEntry: async ({ subject, topic, learnedDate, notes, intervals }) => {
    return request('/learning', {
      method: 'POST',
      body: JSON.stringify({ subject, topic, learnedDate, notes, intervals }),
    });
  },

  getLearningHistory: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '' && params[k] !== 'undefined') {
        cleanParams[k] = params[k];
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/learning${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  deleteLearningEntry: async (id) => {
    return request(`/learning/${id}`, { method: 'DELETE' });
  },

  // Todos (Revision todos by forgetting curve)
  getTodayTodos: async () => {
    return request('/todos/today', { method: 'GET' });
  },

  completeTodo: async (id) => {
    return request(`/todos/${id}/complete`, { method: 'POST' });
  },

  uncompleteTodo: async (id) => {
    return request(`/todos/${id}/uncomplete`, { method: 'POST' });
  },

  getTodoHistory: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((k) => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '' && params[k] !== 'undefined') {
        cleanParams[k] = params[k];
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/todos/history${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  // Notifications
  getNotifications: async () => {
    return request('/notifications', { method: 'GET' });
  },

  markAsRead: async (id) => {
    return request(`/notifications/${id}/read`, { method: 'PUT' });
  },

  markAllAsRead: async () => {
    return request(`/notifications/read-all`, { method: 'PUT' });
  },

  triggerManualNotificationCheck: async () => {
    return request('/notifications/trigger-check', { method: 'POST' });
  },
};

export default api;
