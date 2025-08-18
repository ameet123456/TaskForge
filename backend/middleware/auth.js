import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

export const isAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication required' 
            });
        }

        // Ensure JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            logger.error('JWT_SECRET environment variable is not set');
            return res.status(500).json({ 
                success: false,
                message: 'Server configuration error' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.warn(`Authentication failed: ${error.message}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid token' 
            });
        }

        return res.status(401).json({ 
            success: false,
            message: 'Authentication failed' 
        });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        logger.warn(`Admin access denied for user: ${req.user?.userId}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.status(403).json({ 
            success: false,
            message: 'Admin access required' 
        });
    }
};

export const isTeamLead = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'team_lead')) {
        next();
    } else {
        logger.warn(`Team lead access denied for user: ${req.user?.userId}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.status(403).json({ 
            success: false,
            message: 'Team lead access required' 
        });
    }
}; 