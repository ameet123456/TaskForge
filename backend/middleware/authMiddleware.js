import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user_model.js";
import TeamMember from "../models/team_member_model.js";

dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    console.log("🔑 Decoded JWT:", decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch *all* team memberships
    const teamMembers = await TeamMember.find({ user: user._id });
    console.log("👥 Team memberships found:", teamMembers.length);

    // Map into array
    const teams = teamMembers.map(tm => ({
      teamId: tm.team.toString(),
      role: tm.role,
    }));

    // Expose "main" role + team for backward compatibility
    const primaryTeam = teams.length > 0 ? teams[0] : null;

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin || false,
      teams,                                    // ✅ all memberships
      role: user.isAdmin ? "admin" : primaryTeam?.role || null,  // ✅ fallback role
      teamId: user.isAdmin ? null : primaryTeam?.teamId || null, // ✅ fallback teamId
    };

    console.log("✅ User mapped:", req.user);

    next();
  } catch (error) {
    console.error("JWT error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;
