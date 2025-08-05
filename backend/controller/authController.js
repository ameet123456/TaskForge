import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/user_model.js";
import TeamMember from "../models/team_member_model.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password,  } = req.body;

    if (!role || !["member", "team_lead", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role selection" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });

    await user.save();

    const teamMember = await TeamMember.findOne({ user: user._id });

    const token = jwt.sign(
      {
        userId: user._id,
        isAdmin: user.isAdmin || false,
        role: teamMember?.role || (user.isAdmin ? "admin" : "unknown"),
        teamId: teamMember?.team?._id || null,
        teamName: teamMember?.team?.name || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: teamMember?.role || (user.isAdmin ? "admin" : "unknown"),
          teamId: teamMember?.team?._id || null,
          teamName: teamMember?.team?.name || null,
          isAdmin: user.isAdmin || false,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Error creating user" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const teamMemberships = await TeamMember.find({ user: user._id }).populate(
      "team",
      "name"
    );

    const teams = teamMemberships
      .filter((member) => member.team)
      .map((member) => ({
        teamId: member.team._id,
        teamName: member.team.name,
        role: member.role,
      }));

    const token = jwt.sign(
      {
        userId: user._id,
        isAdmin: user.isAdmin || false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    req.session.token = token;

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,

          isAdmin: user.isAdmin || false,
          teams,
        },
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});
export const googleCallback = async (req, res) => {
    try {
        const { email, name, _id } = req.user;
        let user = await User.findOne({ email });
  
        if (!user) {
          user = new User({ email, name, googleId: req.user.googleId });
          await user.save();
        }
  
        const token = jwt.sign(
          {
            userId: user._id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );
  
        const userData = encodeURIComponent(JSON.stringify(user));
        const redirectURL = `http://localhost:3000/welcome?token=${token}&user=${userData}`;
        res.redirect(redirectURL);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        res.redirect("/login");
      }
};
export const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
};



export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "name email"); 
    
        res.status(200).json({ success: true, users });
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error" });
      }
};
