import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user_model.js";
import TeamMember from "../models/team_member_model.js";

dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    console.log("Decoded JWT:", decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("User not found in DB");
      return res.status(404).json({ message: "User not found" });
    }

    const teamMember = await TeamMember.findOne({ user: user._id });
console.log("TeamMember found:", teamMember);




req.user = {
  id: user._id,
  email: user.email,
  name: user.name,
  isAdmin: user.isAdmin || false,
  role: user.isAdmin ? "admin" : teamMember?.role || null,
  teamId: user.isAdmin ? null : teamMember?.team || null,
};


    console.log("User role:", req.user.role);
    console.log("User isAdmin:", req.user.isAdmin);

    next();
  } catch (error) {
    console.error("JWT error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;
