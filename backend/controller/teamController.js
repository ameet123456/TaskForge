import Team from "../models/team_model.js";
import Project from "../models/project_model.js";
import TeamMember from "../models/team_member_model.js";  
import mongoose from "mongoose";

export const createTeam = async (req, res) => {
  try {
    const { name, description, teamLead, members } = req.body;

    if (!name || !description || !teamLead) {
      return res.status(400).json({ message: "Name, description, and team lead are required." });
    }

    const uniqueMembers = Array.from(new Set([teamLead, ...(members || [])]));

    const team = new Team({
      name,
      description,
      teamLead,
      createdBy: req.user.id,
      members: uniqueMembers
    });

    await team.save();

    const teamMemberDocs = uniqueMembers.map(userId => ({
      team: team._id,
      user: userId,
      role: userId === teamLead ? "team_lead" : "team_member"
    }));

    await TeamMember.insertMany(teamMemberDocs);

    res.status(201).json({
      message: "Team created successfully",
      team
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to create team" 
    });
  }
};



export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("members", "name email")
      .populate("teamLead", "name email");

    const enrichedTeams = await Promise.all(
      teams.map(async (team) => {
        const projects = await Project.find({ team: team._id }).select("name description");
        return {
          ...team.toObject(),
          projects,
        };
      })
    );

    res.status(200).json({ success: true, data: enrichedTeams });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch teams" 
    });
  }
};


export const getTeamById = async (req, res) => {
   try {
     const { id } = req.params;
 
     const team = await Team.findById(id)
       .populate("teamLead", "name email")
       .populate("members", "name email");
 
     if (!team) {
       return res.status(404).json({ message: "Team not found" });
     }
 
     const objectId = new mongoose.Types.ObjectId(id);
     const projects = await Project.find({ team: objectId });
 
     res.status(200).json({ success: true, data: { team, projects } });
   } catch (error) {
     res.status(500).json({ 
      success: false, 
      message: "Failed to fetch team" 
    });
   }
 };
 




export const addUserToTeam = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { userId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.members.includes(userId)) {
      return res.status(400).json({ message: "User already in the team" });
    }

    team.members.push(userId);
    await team.save();

    await TeamMember.create({
      team: teamId,
      user: userId,
      role: "team_member",
    });

    res.status(200).json({ message: "User added to the team", team });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to add member" 
    });
  }
};


export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.isActive = false;
    await team.save();
    
    await TeamMember.deleteMany({ teamId: id });

    res.status(200).json({ message: "Team and all members deleted" });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete team" 
    });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (name) team.name = name;
    if (description) team.description = description;

    await team.save();

    res.status(200).json({ message: "Team updated", team });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to update team" 
    });
  }
};

export const removeUserFromTeam = async (req, res) => {
  try {
    const {id: teamId, userId } = req.params;
    const team = await Team.findById(teamId);
    if(!team){
      return res.status(404).json({ message: "Team not found" });
    }
    const isMember = team.members.includes(userId);
    if (!isMember) {
      return res.status(404).json({ message: "User not found in team" });
    }
    team.members = team.members.filter(member => member.toString() !== userId);
    await team.save();
    await TeamMember.findOneAndDelete({teamId, userId});
    res.status(200).json({ message: "User removed from team", team });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Failed to remove user from team" 
    });
  }
};


