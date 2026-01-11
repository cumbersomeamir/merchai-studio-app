/**
 * Environment configuration
 * Reads from .env file using react-native-config
 * 
 * IMPORTANT: Never commit .env file - it contains sensitive credentials
 */

import Config from 'react-native-config';

// Gemini API Configuration
export const GEMINI_API_KEY = Config.GEMINI_API_KEY || '';

// Google OAuth Credentials
export const GOOGLE_WEB_CLIENT_ID = Config.GOOGLE_WEB_CLIENT_ID || '';
export const GOOGLE_ANDROID_CLIENT_ID = Config.GOOGLE_ANDROID_CLIENT_ID || '';
export const GOOGLE_IOS_CLIENT_ID = Config.GOOGLE_IOS_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = Config.GOOGLE_CLIENT_SECRET || '';

// MongoDB Configuration
export const MONGODB_URI = Config.MONGODB_URI || '';
export const MONGODB_USERNAME = Config.MONGODB_USERNAME || '';
export const MONGODB_PASSWORD = Config.MONGODB_PASSWORD || '';
export const MONGODB_DATABASE = Config.MONGODB_DATABASE || 'merchai-studio';

// MongoDB Atlas Data API Configuration
export const MONGODB_DATA_API_KEY = Config.MONGODB_DATA_API_KEY || '';
export const MONGODB_DATA_API_URL = Config.MONGODB_DATA_API_URL || '';
export const MONGODB_CLUSTER_NAME = Config.MONGODB_CLUSTER_NAME || 'Cluster0';
