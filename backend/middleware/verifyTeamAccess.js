import Project from "../models/project_model.js";
import TeamMember from "../models/team_member_model.js";

const verifyTeamAccess = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.body.projectId;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    if (req.user.isAdmin) {
      console.log("Admin bypass access granted");
      
      req.project = project;
      return next();
    }

    const isMember = await TeamMember.findOne({
      user: req.user.id,
      team: project.team
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You're not a member of this project’s team.",
      });
    }

    req.project = project;
    req.teamMember = isMember;

    next();
  } catch (err) {
    console.error("Error in verifyTeamAccess:", err.message);
    res.status(500).json({ success: false, message: "Server error in access verification" });
  }
};

export default verifyTeamAccess;
