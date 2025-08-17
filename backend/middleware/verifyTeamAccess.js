import Project from "../models/project_model.js";

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

    // Admin shortcut
    if (req.user.isAdmin) {
      console.log("🔓 Admin bypass access granted");
      req.project = project;
      return next();
    }

    if (!project.team) {
      return res.status(400).json({ success: false, message: "Project has no team assigned" });
    }

    const projectTeamId = project.team.toString();
    const userTeams = req.user.teams?.map(t => t.teamId) || [];

    console.log("🔎 Checking team access...");
    console.log("   Project team:", projectTeamId);
    console.log("   User teams:", userTeams);

    if (!userTeams.includes(projectTeamId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You're not a member of this project’s team.",
      });
    }

    req.project = project;
    next();
  } catch (err) {
    console.error("❌ Error in verifyTeamAccess:", err.message);
    res.status(500).json({ success: false, message: "Server error in access verification" });
  }
};

export default verifyTeamAccess;
