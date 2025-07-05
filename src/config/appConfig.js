// Central configuration file that imports all environment variables

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: import.meta.env.VITE_API_TIMEOUT || 10000,
};
