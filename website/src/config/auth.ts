// Google OAuth client ID from Google Developer Console
// Using environment variables for security
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Fallback to development mode with a warning if the client ID is not set
if (!GOOGLE_CLIENT_ID) {
  console.warn('Google Client ID not found in environment variables. Google Sign-In will not work.');
  console.warn('Please create a .env.local file with VITE_GOOGLE_CLIENT_ID set to your Google Client ID.');
}

// JWT token storage key in localStorage
export const JWT_STORAGE_KEY = 'casual_pay_jwt_token';

// User info storage key in localStorage
export const USER_STORAGE_KEY = 'casual_pay_user_info';
