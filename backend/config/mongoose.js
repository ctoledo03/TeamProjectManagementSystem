const mongoose = require('mongoose');
const config = require('./config');

// Mongoose connection configuration
const configureMongoose = async () => {
  try {
    await mongoose.connect(config.db);
    console.log(`Connected to MongoDB at ${config.db}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = configureMongoose;
