import jwt from "jsonwebtoken";
import User from "../models/user_model.js";
import TeamMember from "../models/team_member_model.js";
import logger from "../config/logger.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from headers
    const authHeader = req.header("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "No token, authorization denied" 
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // 2. Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fix: Use userId (not id) because that's what we create in the JWT
    const userId = decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token payload" 
      });
    }

    // 4. Fetch user from DB
    const user = await User.findById(userId).select("name email isAdmin");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // 5. Get user's team memberships and roles
    const teamMemberships = await TeamMember.find({ user: userId })
      .populate('team', 'name')
      .lean();

    // 6. Extract user roles and teams
    const teams = teamMemberships.map(membership => ({
      teamId: membership.team?._id,
      teamName: membership.team?.name,
      role: membership.role
    }));

    // 7. Determine primary role (highest priority role)
    let primaryRole = 'member'; // default
    if (user.isAdmin) {
      primaryRole = 'admin';
    } else if (teamMemberships.some(m => m.role === 'team_lead')) {
      primaryRole = 'team_lead';
    } else if (teamMemberships.some(m => m.role === 'team_member')) {
      primaryRole = 'team_member';
    }

    // 8. Attach comprehensive user details to request
    req.user = {
      id: user._id,
      userId: user._id, // For backward compatibility
      name: user.name,
      email: user.email,
      role: primaryRole,
      isAdmin: user.isAdmin || false,
      teams: teams,
      // For quick team access
      teamIds: teams.map(t => t.teamId?.toString()).filter(Boolean)
    };

    logger.info(`User authenticated: ${user.email}`, {
      userId: user._id,
      role: primaryRole,
      teamsCount: teams.length
    });

    next();
  } catch (error) {
    logger.error("Authentication error:", {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    res.status(401).json({ 
      success: false, 
      message: "Token is not valid" 
    });
  }
};

export default authMiddleware;