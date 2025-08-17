import Team from "../models/team_model.js";
import User from "../models/user_model.js";
import TeamMember from "../models/team_member_model.js";  
import mongoose from "mongoose";

export const updateTeamMemberRole = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    const validRoles = ["team_member", "team_lead"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    const teamMember = await TeamMember.findOne({ team: teamId, user: userId });
    if (!teamMember) {
      return res.status(404).json({ message: "User not found in team" });
    }

    if (role === "team_lead") {
      const currentLead = await TeamMember.findOne({ team: teamId, role: "team_lead" });

      if (currentLead && currentLead.user.toString() !== userId) {
        currentLead.role = "team_member";
        await currentLead.save();
      }

      await Team.findByIdAndUpdate(teamId, { teamLead: userId });
    }

    teamMember.role = role;
    await teamMember.save();

    res.status(200).json({
      message: `User role updated to '${role}'`,
      teamMember,
    });
  } catch (error) {
    console.error("Error updating user role in team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid team ID format' 
      });
    }

    console.log("Fetching team members for teamId:", teamId);
    
    const members = await TeamMember.find({ team: teamId }).populate('user', 'name email');

    if (!members || members.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No team members found' 
      });
    }

    const formattedMembers = members.map(m => ({
      _id: m.user._id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    }));

    console.log("Found team members:", formattedMembers);
    res.status(200).json({ success: true, members: formattedMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};

export const getSingleTeamMember = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const member = await TeamMember.findOne({ team: teamId, user: userId }).populate("user", "name email role");

    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    res.status(200).json({ success: true, member });
  } catch (error) {
    console.error("Error fetching single team member:", error);
    res.status(500).json({ message: "Server error" });
  }
};
  
export const getMyTeams = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const memberships = await TeamMember.find({ user: userId })
      .populate("team", "name");

    const formattedTeams = memberships.map((m) => ({
      teamId: m.team._id.toString(), // ← Fixed: use _id instead of id
      teamName: m.team.name, // ← Fixed: use name instead of teamName (based on populate)
      role: m.role
    }));

    console.log("User teams:", formattedTeams);
    res.status(200).json(formattedTeams);
  } catch (error) {
    console.error("Error fetching user's teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeUserFromTeam = async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const isMember = team.members.includes(userId);
    if (!isMember) return res.status(404).json({ message: "User not in team" });

    team.members = team.members.filter((member) => member.toString() !== userId);
    await team.save();

    await TeamMember.findOneAndUpdate(
      { team: teamId, user: userId },
      { isActive: false }
    );

    res.status(200).json({ message: "User soft-removed from team" });
  } catch (error) {
    console.error("Error removing user from team:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addUserToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId } = req.body;

    console.log("addUserToTeam called");
    console.log("teamId:", teamId);
    console.log("userId:", userId);

    if (!teamId || !userId) {
      return res.status(400).json({ message: "Missing teamId or userId" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    console.log("Team found:", team.name);

    const existing = await TeamMember.findOne({ team: teamId, user: userId });
    if (existing && existing.isActive) {
      return res.status(409).json({ message: "User already in team" });
    }

    if (existing && !existing.isActive) {
      existing.isActive = true;
      await existing.save();
      return res.status(200).json({ message: "User re-added to team", member: existing });
    }

    const newMember = await TeamMember.create({
      user: userId,
      team: teamId,
      role: "team_member",
      isAdmin: false,
    });

    if (!team.members.includes(userId)) {
      team.members.push(userId);
      await team.save();
    }

    console.log("🎉 Member added to team:", newMember);
    res.status(201).json({ message: "User added to team", member: newMember });
  } catch (error) {
    console.error("Error in addUserToTeam:", error);
    res.status(500).json({ message: "Server error" });
  }
};