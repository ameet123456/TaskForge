import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

export const isTeamLead = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'team_lead')) {
        next();
    } else {
        res.status(403).json({ message: 'Team lead access required' });
    }
}; 