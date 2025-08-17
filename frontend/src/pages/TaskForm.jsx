import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import { 
  ArrowLeft,
  CheckSquare,
  FileText,
  Calendar,
  Flag,
  User,
  Building2,
  Loader2,
  AlertCircle
} from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

const TaskForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    state: "pending",
    priority: "medium",
    assignedTo: "",
    projectId: "",
    teamId: ""
  });

  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTeamInfo, setSelectedTeamInfo] = useState(null);
  const [selectedProjectInfo, setSelectedProjectInfo] = useState(null);

  // Check if projectId is coming from navigation
  const isProjectFromNavigation = location.state?.projectId;

  useEffect(() => {
    const initializeForm = async () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);

      const { projectId, projectName, teamId } = location.state || {};

      if (userData?.isAdmin) {
        await fetchTeams();
        
        if (projectId) {
          setFormData(prev => ({ ...prev, projectId, teamId: teamId || "" }));
          if (teamId) {
            await fetchTeamMembers(teamId);
          }
          if (projectName) {
            setSelectedProjectInfo({ name: projectName });
          } else {
            await fetchProjectDetails(projectId);
          }
        }
      } else if (userData?.teams && userData.teams.length > 0) {
        if (projectId) {
          await handleProjectFromNavigation(userData, projectId, teamId);
        } else {
          await autoSelectTeamAndProject(userData);
        }
      }
    };

    initializeForm();
  }, [location.state]);

  const handleProjectFromNavigation = async (userData, projectId, teamId) => {
    try {
      const projectResponse = await API.get(`/projects/${projectId}`);
      const project = projectResponse.data.project;
      
      // Extract the actual team ID properly
      let actualTeamId;
      if (teamId) {
        actualTeamId = teamId;
      } else if (typeof project.team === 'object' && project.team._id) {
        actualTeamId = project.team._id;
      } else if (typeof project.team === 'string') {
        actualTeamId = project.team;
      } else if (project.teamId) {
        actualTeamId = project.teamId;
      }
      
      // Find team info
      let teamInfo = null;
      if (userData.teams && userData.teams.length > 0) {
        teamInfo = userData.teams.find(team => team._id === actualTeamId);
      }
      
      // If not found in userData.teams, use the team info from project
      if (!teamInfo && typeof project.team === 'object') {
        teamInfo = {
          _id: project.team._id,
          name: project.team.name
        };
      }
      
      // If still not found, fetch from API
      if (!teamInfo && actualTeamId) {
        try {
          const teamResponse = await API.get(`/teams/${actualTeamId}`);
          teamInfo = teamResponse.data.team || teamResponse.data;
        } catch (error) {
          console.error("Error fetching team details:", error);
        }
      }
      
      setSelectedTeamInfo(teamInfo);
      
      setSelectedProjectInfo({
        name: project.name,
        description: project.description
      });
      
      setFormData(prev => ({
        ...prev,
        projectId: projectId,
        teamId: actualTeamId
      }));
      
      if (actualTeamId) {
        await fetchTeamMembers(actualTeamId);
      }
      
    } catch (error) {
      console.error("Error handling project from navigation:", error);
      setError("Failed to load project information.");
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await API.get(`/projects/${projectId}`);
      const project = response.data.project;
      
      setSelectedProjectInfo({
        name: project.name,
        description: project.description
      });
      
      return project;
    } catch (error) {
      console.error("Error fetching project details:", error);
      setError("Failed to load project details.");
    }
  };

  const autoSelectTeamAndProject = async (userData) => {
    try {
      // Debug: Check what's in localStorage and userData
      console.log("🔍 DEBUG - localStorage teamId:", localStorage.getItem("teamId"));
      console.log("🔍 DEBUG - userData.teamId:", userData.teamId);
      console.log("🔍 DEBUG - userData.teams:", userData.teams);
      console.log("🔍 DEBUG - first team ID:", userData.teams?.[0]?._id);
      
      const currentTeamId = localStorage.getItem("teamId") || userData.teamId || userData.teams?.[0]?.teamId;
      console.log("🔍 DEBUG - Final currentTeamId:", currentTeamId);
      
      let activeTeam = null;
      
      // Try to find the team in userData.teams
      if (userData.teams && userData.teams.length > 0) {
        console.log("🔍 DEBUG - Searching for team in userData.teams...");
        activeTeam = userData.teams.find(team => team.teamId === currentTeamId);
        console.log("🔍 DEBUG - Found activeTeam in userData.teams:", activeTeam);
        
        // If not found by ID, try the first team
        if (!activeTeam) {
          activeTeam = userData.teams[0];
          console.log("🔍 DEBUG - Using first team as fallback:", activeTeam);
        }
      }
      
      // If still no team found, fetch from API
      if (!activeTeam && currentTeamId) {
        console.log("🔍 DEBUG - Fetching team from API with ID:", currentTeamId);
        try {
          const teamResponse = await API.get(`/teams/${currentTeamId}`);
          activeTeam = teamResponse.data.team || teamResponse.data;
          console.log("🔍 DEBUG - Team fetched from API:", activeTeam);
        } catch (error) {
          console.error("❌ Error fetching team from API:", error);
        }
      }
      
      console.log("🔍 DEBUG - Final activeTeam:", activeTeam);
      
      // Transform the team object to match expected structure for display
      const teamInfoForDisplay = activeTeam ? {
        _id: activeTeam.teamId,
        name: activeTeam.teamName,
        role: activeTeam.role
      } : null;
      
      console.log("🔍 DEBUG - teamInfoForDisplay:", teamInfoForDisplay);
      setSelectedTeamInfo(teamInfoForDisplay);
      
      const teamIdToUse = activeTeam?.teamId || currentTeamId;
      console.log("🔍 DEBUG - teamIdToUse:", teamIdToUse);
      setFormData(prev => ({ ...prev, teamId: teamIdToUse }));
      
      if (teamIdToUse) {
        console.log("🔍 DEBUG - Fetching team members and projects for team:", teamIdToUse);
        await fetchTeamMembers(teamIdToUse);
        await autoSelectProject(teamIdToUse);
      } else {
        console.log("❌ DEBUG - No teamIdToUse found, skipping team members and projects fetch");
      }
      
    } catch (error) {
      console.error("❌ Error in auto-selecting team and project:", error);
      setError("Failed to load team and project information.");
    }
  };

  const autoSelectProject = async (teamId) => {
    try {
      console.log("🔍 DEBUG - autoSelectProject called with teamId:", teamId);
      const response = await API.get("/projects");
      console.log("🔍 DEBUG - All projects from API:", response.data.projects);
      
      const teamProjects = response.data.projects.filter(
        (project) => {
          console.log("🔍 DEBUG - Checking project:", project.name, "project.team:", project.team, "teamId:", teamId);
          return project.team?.toString() === teamId.toString();
        }
      );
      
      console.log("🔍 DEBUG - Filtered teamProjects:", teamProjects);
      
      if (teamProjects.length > 0) {
        const selectedProject = teamProjects[0];
        console.log("🔍 DEBUG - Selected first project:", selectedProject);
        
        setSelectedProjectInfo({
          name: selectedProject.name,
          description: selectedProject.description
        });
        
        setFormData(prev => ({ 
          ...prev, 
          projectId: selectedProject._id 
        }));
        
        setProjects(teamProjects);
      } else {
        console.log("❌ DEBUG - No projects found for teamId:", teamId);
        setError("No projects available for your team. Please contact your admin.");
      }
    } catch (error) {
      console.error("❌ Error auto-selecting project:", error);
      setError("Failed to load project information.");
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await API.get("/teams");
      setTeams(response.data.data);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams.");
    }
  };

  const fetchTeamMembers = async (team) => {
    try {
      const teamId = team._id || team; 
      const response = await API.get(`/team-members/${teamId}`);
  
      if (response.data.success) {
        setTeamMembers(response.data.members);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
      setError("Failed to load team members.");
    }
  };

  const fetchProjects = async (teamId) => {
    try {
      const response = await API.get("/projects");
      
      const filteredProjects = response.data.projects.filter(
        (project) => project.team?.toString() === teamId.toString()
      );
      
      setProjects(filteredProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects.");
    }
  };

  const handleProjectChange = async (e) => {
    const selectedProjectId = e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      projectId: selectedProjectId,
      assignedTo: ""
    }));

    if (selectedProjectId) {
      try {
        const res = await API.get(`/projects/${selectedProjectId}`);
        const teamId = res.data.project.team || res.data.project.teamId;
        fetchTeamMembers(teamId);
      } catch (err) {
        console.error("Failed to fetch team from project:", err);
        setError("Failed to load project details.");
      }
    }
  };

  const handleTeamChange = async (e) => {
    const selectedTeamId = e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      teamId: selectedTeamId,
      projectId: "",
      assignedTo: ""
    }));

    if (selectedTeamId) {
      fetchTeamMembers(selectedTeamId);
      fetchProjects(selectedTeamId);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.dueDate || !formData.teamId) {
      setError("All fields are required.");
      return false;
    }
    
    if (!user?.isAdmin && !formData.projectId) {
      setError("Project selection is required.");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!validateForm()) return;
  
    setLoading(true);
    try {
      const response = await API.post("/tasks", formData);
      
      if (response.data.success) {
        // Navigate to the project details page using the projectId from formData
        navigate(`/projects/${formData.projectId}`);
      } else {
        setError("Task creation failed.");
      }
    } catch (err) {
      console.error("Error creating task:", err);
      setError("Task creation error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/tasks")}
            className="w-10 h-10 rounded-full bg-[#2d2d2d] hover:bg-[#FF1E00] flex items-center justify-center transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-[40px] font-bold">Create New Task</h1>
            <p className="text-white/70">Set up a new task and assign it to team members</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2d2d2d] rounded-xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Team and Project Info - Show dropdown if no projectId from navigation, otherwise show read-only */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-gray-600">
                
                {/* Team Selection/Info */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-medium text-white">
                    <Building2 className="w-5 h-5" />
                    {user?.isAdmin ? 'Select Team' : 'Team'}
                  </label>
                  
                  {user?.isAdmin ? (
                    // Admin: Show team dropdown
                    <div className="relative">
                      <select
                        name="teamId"
                        value={formData.teamId}
                        onChange={handleTeamChange}
                        className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors appearance-none cursor-pointer"
                        required
                      >
                        <option value="" className="bg-[#191818]">Select a team</option>
                        {teams.map((team) => (
                          <option key={team._id} value={team._id} className="bg-[#191818]">
                            {team.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    // Non-admin: Show selected team info (read-only)
                    <div className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {selectedTeamInfo?.name || 'Loading...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Project Selection/Info */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-medium text-white">
                    <CheckSquare className="w-5 h-5" />
                    {!isProjectFromNavigation ? 'Select Project' : 'Project'}
                  </label>
                  
                  {!isProjectFromNavigation ? (
                    // No projectId from navigation: Show project dropdown
                    <div className="relative">
                      <select
                        name="projectId"
                        value={formData.projectId}
                        onChange={handleProjectChange}
                        className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors appearance-none cursor-pointer"
                        disabled={!formData.teamId}
                      >
                        <option value="" className="bg-[#191818]">Select a project</option>
                        {projects.map((project) => (
                          <option key={project._id} value={project._id} className="bg-[#191818]">
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    // ProjectId from navigation: Show selected project info (read-only)
                    <div className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {selectedProjectInfo?.name || 'Loading...'}
                        </span>
                        {selectedProjectInfo?.description && (
                          <span className="text-sm text-gray-400 mt-1">
                            {selectedProjectInfo.description}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-medium text-white">
                    <CheckSquare className="w-5 h-5" />
                    Task Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter a clear, descriptive task title"
                    className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors placeholder-gray-400"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-medium text-white">
                    <FileText className="w-5 h-5" />
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Provide detailed information about this task..."
                    className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors placeholder-gray-400 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-lg font-medium text-white">
                      <Calendar className="w-5 h-5" />
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-lg font-medium text-white">
                      <Flag className="w-5 h-5" />
                      Priority
                    </label>
                    <div className="relative">
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="low" className="bg-[#191818]">Low Priority</option>
                        <option value="medium" className="bg-[#191818]">Medium Priority</option>
                        <option value="high" className="bg-[#191818]">High Priority</option>
                        <option value="critical" className="bg-[#191818]">Critical Priority</option>
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-lg font-medium text-white">
                      <User className="w-5 h-5" />
                      Assign To Team Member
                    </label>
                    <div className="relative">
                      <select
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors appearance-none cursor-pointer"
                        disabled={teamMembers.length === 0}
                      >
                        <option value="" className="bg-[#191818]">
                          {teamMembers.length === 0 ? "Loading team members..." : "Leave unassigned"}
                        </option>
                        {teamMembers.map((member) => (
                          <option key={member._id} value={member._id} className="bg-[#191818]">
                            {member.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {formData.assignedTo && (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <User className="w-4 h-4" />
                        <span>Task will be assigned to {teamMembers.find(m => m._id === formData.assignedTo)?.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-600">
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="text-white/70 hover:text-white border border-gray-600 hover:border-gray-500 px-8 py-3 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (!user?.isAdmin && !formData.projectId)}
                  className="bg-[#FF1E00] hover:bg-red-600 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 min-w-[140px] justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      Create Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;