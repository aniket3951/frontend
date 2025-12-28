/**
 * API Configuration
 * Change API_BASE_URL to point to your backend server
 */

// For production, use your backend URL
// Example: 'https://your-backend-url.onrender.com'
const API_BASE_URL = window.location.origin; // Uses same origin as frontend

// For local development with separate backend, use:
// const API_BASE_URL = 'http://localhost:5000';

export const config = {
  API_BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    BOOKING: `${API_BASE_URL}/api/book`,
    REVIEWS: `${API_BASE_URL}/api/reviews`,
    HEALTH: `${API_BASE_URL}/api/health`
  }
};

