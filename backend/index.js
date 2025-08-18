import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import { 
    rateLimiter, 
    authRateLimiter, 
    securityHeaders, 
    compressionMiddleware,
    validateInput,
    requestSizeLimit
} from "./middleware/security.js";

import userRoutes from "./routes/user_route.js";
import taskRoutes from "./routes/task_route.js";
import teamRoutes from "./routes/team_route.js";
import teamMemberRoutes from "./routes/team_member_route.js";
import projectRoutes from "./routes/project_route.js";

import "./config/passportConfig.js";

// Load environment variables first
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'JWT_SECRET', 
    'SESSION_SECRET',
    'MONGODB_URI'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    logger.error('Please check your .env file and ensure all required variables are set');
    process.exit(1);
}

// Validate JWT_SECRET and SESSION_SECRET length for security
if (process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters long for security');
    process.exit(1);
}

if (process.env.SESSION_SECRET.length < 32) {
    logger.error('SESSION_SECRET must be at least 32 characters long for security');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to database with error handling
let isShuttingDown = false;

const initializeDatabase = async () => {
    try {
        await connectDB();
        logger.info('✅ Database connected successfully');
    } catch (error) {
        logger.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

// Initialize database connection
await initializeDatabase();

// Security middleware (apply early)
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(requestSizeLimit);

// Trust proxy in production (for proper IP detection behind load balancers)
if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    logger.info('🔒 Trust proxy enabled for production');
}

// Body parsing middleware with enhanced error handling
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            logger.warn('Invalid JSON payload received', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                contentLength: req.get('Content-Length')
            });
            throw new Error('Invalid JSON');
        }
    }
}));

app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb',
    parameterLimit: 1000 // Prevent parameter pollution
}));

// Enhanced CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [process.env.FRONTEND_URL || "http://localhost:3000"];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            logger.warn(`CORS blocked request from origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
};

app.use(cors(corsOptions));

// Enhanced session configuration with MongoDB store
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600, // Update session once per day
        ttl: 24 * 60 * 60, // Session TTL in seconds (24 hours)
        autoRemove: 'native', // Use MongoDB TTL
        stringify: false // Better performance
    }),
    cookie: { 
        secure: NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
        sameSite: NODE_ENV === 'production' ? 'strict' : 'lax'
    },
    name: process.env.SESSION_NAME || 'taskforge_session',
    rolling: true // Reset expiration on activity
};

app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting (apply before routes)
app.use('/api/auth', authRateLimiter); // Stricter for auth endpoints
app.use('/api', rateLimiter); // General rate limiting

// Input validation
app.use('/api', validateInput);

// Request logging middleware (for production monitoring)
app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
        
        logger[logLevel]('HTTP Request', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            contentLength: res.get('Content-Length') || 0
        });
    });
    
    next();
});

// Health check endpoint with detailed information
app.get('/health', async (req, res) => {
    const healthCheck = {
        success: true,
        message: 'TaskForge API is running',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    };

    // Check database connectivity
    try {
        const dbState = mongoose.connection.readyState;
        const dbStates = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        healthCheck.database = {
            status: dbStates[dbState],
            connected: dbState === 1
        };

        // If database is connected, do a simple query
        if (dbState === 1) {
            await mongoose.connection.db.admin().ping();
            healthCheck.database.ping = 'success';
        }
    } catch (error) {
        healthCheck.database = {
            status: 'error',
            connected: false,
            error: error.message
        };
        healthCheck.success = false;
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    healthCheck.memory = {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB'
    };

    const statusCode = healthCheck.success ? 200 : 503;
    res.status(statusCode).json(healthCheck);
});

// Ready check endpoint (for Kubernetes readiness probes)
app.get('/ready', async (req, res) => {
    try {
        // Check if database is ready
        const dbState = mongoose.connection.readyState;
        if (dbState !== 1) {
            throw new Error('Database not ready');
        }

        // Perform a simple database operation
        await mongoose.connection.db.admin().ping();

        res.status(200).json({
            success: true,
            message: 'Service is ready',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Readiness check failed:', error);
        res.status(503).json({
            success: false,
            message: 'Service not ready',
            error: error.message
        });
    }
});

// Metrics endpoint (basic metrics for monitoring)
app.get('/metrics', (req, res) => {
    const metrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        nodeVersion: process.version
    };

    res.json(metrics);
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/projects", projectRoutes);

// 404 handler for non-API routes
app.use('*', (req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler with enhanced logging
app.use((err, req, res, next) => {
    // Log error with context
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body ? JSON.stringify(req.body).substring(0, 1000) : 'No body', // Truncate large bodies
        timestamp: new Date().toISOString()
    });

    // Handle specific error types
    let statusCode = err.status || err.statusCode || 500;
    let message = 'Internal server error';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    } else if (err.code === 11000) { // MongoDB duplicate key
        statusCode = 409;
        message = 'Resource already exists';
    } else if (NODE_ENV === 'development') {
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(NODE_ENV === 'development' && { 
            stack: err.stack,
            error: err.name 
        }),
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    if (isShuttingDown) {
        logger.warn('Shutdown already in progress...');
        return;
    }

    isShuttingDown = true;
    logger.info(`${signal} received, starting graceful shutdown...`);

    // Set a timeout for forced shutdown
    const forceShutdownTimeout = setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
    }, 30000); // 30 seconds

    try {
        // Close server
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            logger.info('✅ HTTP server closed');
        }

        // Close database connection
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            logger.info('✅ Database connection closed');
        }

        clearTimeout(forceShutdownTimeout);
        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Error during shutdown:', error);
        clearTimeout(forceShutdownTimeout);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack
    });
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', {
        reason: reason,
        promise: promise
    });
    gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 TaskForge server running on port ${PORT} in ${NODE_ENV} mode`);
    logger.info(`🌐 Environment: ${NODE_ENV}`);
    logger.info(`🔒 Security: ${NODE_ENV === 'production' ? 'Production mode' : 'Development mode'}`);
    logger.info(`💾 Database: Connected to MongoDB`);
    logger.info(`🎯 Health check: http://localhost:${PORT}/health`);
    
    if (NODE_ENV === 'development') {
        logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
        logger.info(`✅ Ready check: http://localhost:${PORT}/ready`);
    }
});

// Handle server errors
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    switch (error.code) {
        case 'EACCES':
            logger.error(`Port ${PORT} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(`Port ${PORT} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

export default app;