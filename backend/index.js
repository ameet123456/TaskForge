import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";

import userRoutes from "./routes/user_route.js";
import taskRoutes from "./routes/task_route.js";
import teamRoutes from "./routes/team_route.js";
import teamMemberRoutes from "./routes/team_member_route.js";
import projectRoutes from "./routes/project_route.js";

import "./config/passportConfig.js";
import { rateLimiter, authRateLimiter, securityHeaders, compressionMiddleware, validateInput, requestSizeLimit } from "./middleware/security.js";

// Load env vars
dotenv.config();

// Validate essential env vars
['JWT_SECRET','SESSION_SECRET','MONGODB_URI'].forEach(varName => {
    if (!process.env[varName]) {
        logger.error(`${varName} is missing in .env`);
        process.exit(1);
    }
});

// Ensure secrets are strong
if (process.env.JWT_SECRET.length < 32 || process.env.SESSION_SECRET.length < 32) process.exit(1);

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
await connectDB();

// Security middleware
app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(requestSizeLimit);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, callback) => !origin || allowedOrigins.includes(origin) ? callback(null,true) : callback(new Error('Not allowed by CORS')),
    methods: ["GET","POST","PUT","DELETE","PATCH","OPTIONS"],
    credentials: true
}));

// Body parsing
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true, limit:'10mb', parameterLimit:1000 }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, ttl: 24*60*60 }),
    cookie: { secure: NODE_ENV==='production', httpOnly:true, maxAge: parseInt(process.env.SESSION_MAX_AGE), sameSite: NODE_ENV==='production'?'strict':'lax' },
    name: process.env.SESSION_NAME,
    rolling: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
app.use('/api/auth', authRateLimiter);
app.use('/api', rateLimiter);

// Input validation
app.use('/api', validateInput);

// Health & ready checks
app.get('/health', (req,res)=> res.status(200).json({success:true,message:'TaskForge API is running'}));
app.get('/ready', async (req,res)=>{
    try {
        if(mongoose.connection.readyState!==1) throw new Error('DB not ready');
        await mongoose.connection.db.admin().ping();
        res.status(200).json({success:true,message:'Service ready'});
    } catch(e){
        res.status(503).json({success:false,message:'Service not ready',error:e.message});
    }
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/projects", projectRoutes);

// 404 handler
app.use('*',(req,res)=>res.status(404).json({success:false,message:'Route not found',path:req.originalUrl}));

// Global error handler
app.use((err, req, res, next)=>{
    logger.error('Unhandled error', err);
    res.status(err.status||500).json({success:false,message:err.message||'Internal server error'});
});

// Start server
const server = app.listen(PORT,'0.0.0.0',()=> logger.info(`🚀 Server running on port ${PORT} in ${NODE_ENV}`));

// Graceful shutdown
const gracefulShutdown = async(signal)=>{
    server.close();
    if(mongoose.connection.readyState===1) await mongoose.connection.close();
    process.exit(0);
};
process.on('SIGTERM', ()=>gracefulShutdown('SIGTERM'));
process.on('SIGINT', ()=>gracefulShutdown('SIGINT'));

export default app;
