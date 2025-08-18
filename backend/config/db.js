import mongoose from 'mongoose';
import logger from './logger.js';

// Connection options for different environments
const getConnectionOptions = () => {
  const baseOptions = {
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10, // Maximum number of connections
    serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
    socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
    family: 4, // Use IPv4, skip trying IPv6
  };

  // Production-specific options
  if (process.env.NODE_ENV === 'production') {
    return {
      ...baseOptions,
      retryWrites: true,
      w: 'majority', // Write concern
      readPreference: 'primaryPreferred',
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      heartbeatFrequencyMS: 10000, // Check connection health every 10 seconds
    };
  }

  // Development options
  return baseOptions;
};

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    // Validate MongoDB URI
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Log connection attempt (without credentials)
    const sanitizedURI = mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    logger.info('Attempting database connection...', { 
      uri: sanitizedURI,
      environment: process.env.NODE_ENV 
    });

    const options = getConnectionOptions();
    const connection = await mongoose.connect(mongoURI, options);

    logger.info('✅ Database connected successfully', {
      host: connection.connection.host,
      port: connection.connection.port,
      database: connection.connection.name,
      readyState: connection.connection.readyState
    });

    return connection;

  } catch (error) {
    logger.error('❌ Database connection failed:', {
      error: error.message,
      retries: retries,
      environment: process.env.NODE_ENV
    });

    // Retry logic for connection failures
    if (retries > 0) {
      logger.info(`Retrying database connection... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      return connectDB(retries - 1);
    }

    // Exit process if all retries failed
    logger.error('All database connection attempts failed. Exiting...');
    process.exit(1);
  }
};

// Enhanced connection event handlers
const setupConnectionHandlers = () => {
  const db = mongoose.connection;

  // Connection opened
  db.on('connected', () => {
    logger.info('Mongoose connected to MongoDB');
  });

  // Connection error
  db.on('error', (error) => {
    logger.error('Mongoose connection error:', {
      error: error.message,
      stack: error.stack
    });
  });

  // Connection disconnected
  db.on('disconnected', () => {
    logger.warn('Mongoose disconnected from MongoDB');
  });

  // Reconnected
  db.on('reconnected', () => {
    logger.info('Mongoose reconnected to MongoDB');
  });

  // Connection ready
  db.on('open', () => {
    logger.info('MongoDB connection opened');
  });

  // If Node process ends, close the Mongoose connection
  process.on('SIGINT', async () => {
    try {
      await db.close();
      logger.info('Mongoose connection closed due to application termination (SIGINT)');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing mongoose connection:', error);
      process.exit(1);
    }
  });

  process.on('SIGTERM', async () => {
    try {
      await db.close();
      logger.info('Mongoose connection closed due to application termination (SIGTERM)');
      process.exit(0);
    } catch (error) {
      logger.error('Error closing mongoose connection:', error);
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    logger.error('Uncaught Exception:', error);
    try {
      await db.close();
      process.exit(1);
    } catch (closeError) {
      logger.error('Error closing connection after uncaught exception:', closeError);
      process.exit(1);
    }
  });
};

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    if (state !== 1) {
      throw new Error(`Database not connected. State: ${states[state]}`);
    }

    // Perform a simple ping to check if database is responsive
    await mongoose.connection.db.admin().ping();
    
    return {
      status: 'healthy',
      state: states[state],
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Get database statistics
export const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      objects: stats.objects,
      storageSize: stats.storageSize
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    throw error;
  }
};

// Initialize database connection with event handlers
const initializeDatabase = async () => {
  setupConnectionHandlers();
  return await connectDB();
};

export default initializeDatabase;