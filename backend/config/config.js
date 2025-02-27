const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Dynamically load the configuration file based on NODE_ENV
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    db: process.env.MONGO_URI || 'mongodb://localhost:27017/lab2',
    sessionSecret: process.env.SESSION_SECRET || 'developmentSessionSecret',
  },
  production: {
    db: process.env.MONGO_URI, // Ensure MONGO_URI is set in your production environment
    sessionSecret: process.env.SESSION_SECRET, // Ensure SESSION_SECRET is set in production
  },
};

// Export the configuration for the current environment
module.exports = config[env];
