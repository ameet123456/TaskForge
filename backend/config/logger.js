import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

// Custom format for console output
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.colorize({ all: true, colors: logColors }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

// Create transports array
const logTransports = [
  // Console transport
  new transports.Console({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: consoleFormat
  }),

  // File transport for errors
  new transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  }),

  // File transport for all logs
  new transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat,
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5
  })
];

// Add daily rotate file transport for production
if (process.env.NODE_ENV === 'production') {
  // You can add winston-daily-rotate-file here if needed
  // For now, we'll use regular file transport
}

// Create the logger
const logger = createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: fileFormat,
  transports: logTransports,
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat
    })
  ],
  
  rejectionHandlers: [
    new transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat
    })
  ],

  // Exit on error
  exitOnError: false
});

// Add request logging method
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userId: req.user?.userId || 'anonymous',
    timestamp: new Date().toISOString()
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// Add custom methods for common log patterns
logger.security = (message, meta = {}) => {
  logger.warn(`SECURITY: ${message}`, {
    ...meta,
    type: 'security',
    timestamp: new Date().toISOString()
  });
};

logger.performance = (message, meta = {}) => {
  logger.info(`PERFORMANCE: ${message}`, {
    ...meta,
    type: 'performance',
    timestamp: new Date().toISOString()
  });
};

logger.database = (message, meta = {}) => {
  logger.info(`DATABASE: ${message}`, {
    ...meta,
    type: 'database',
    timestamp: new Date().toISOString()
  });
};

logger.auth = (message, meta = {}) => {
  logger.info(`AUTH: ${message}`, {
    ...meta,
    type: 'auth',
    timestamp: new Date().toISOString()
  });
};

// Stream for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

export default logger;