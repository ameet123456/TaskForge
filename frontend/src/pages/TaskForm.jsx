import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    state: "pending",
    priority: "medium",
    assignedTo: "",
    projectId: ""
  });

  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);

    if (userData?.isAdmin) {
      fetchTeams();
    } else if (userData?.teamId) {
      setFormData((prev) => ({ ...prev, teamId: userData.teamId }));
      fetchTeamMembers(userData.teamId);
      fetchProjects(userData.teamId);
    }
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await API.get("/teams");
      setTeams(response.data.data);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    try {
      const response = await API.get(`/team-members/${teamId}`);
      if (response.data.success) {
        setTeamMembers(response.data.members);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  };

  const fetchProjects = async (teamId) => {
    try {
      const response = await API.get("/projects");
      const filteredProjects = response.data.projects.filter(
        (project) => project.teamId?.toString() === teamId.toString()
      );
      setProjects(filteredProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleProjectChange = async (e) => {
    const selectedProjectId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      projectId: selectedProjectId,
      assignedTo: ""
    }));

    try {
      const res = await API.get(`/projects/${selectedProjectId}`);
      const teamId = res.data.project.teamId;
      fetchTeamMembers(teamId);
    } catch (err) {
      console.error("Failed to fetch team from project:", err);
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

    fetchTeamMembers(selectedTeamId);
    fetchProjects(selectedTeamId);
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
        console.log("Task created successfully!");
        navigate("/tasks");
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

        {/* Main Form Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2d2d2d] rounded-xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Admin Section - Team & Project Selection */}
              {user?.isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-gray-600">
                  {/* Team Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-lg font-medium text-white">
                      <Building2 className="w-5 h-5  " />
                      Select Team
                    </label>
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
                  </div>

                  {/* Project Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-lg font-medium text-white">
                      <CheckSquare className="w-5 h-5  " />
                      Select Project
                    </label>
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
                  </div>
                </div>
              )}

              {/* Task Details Section */}
              <div className="space-y-6">
                {/* Task Title */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-medium text-white">
                    <CheckSquare className="w-5 h-5  " />
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

                {/* Task Description */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-lg font-medium text-white">
                    <FileText className="w-5 h-5  " />
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

                {/* Task Configuration Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Due Date */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-lg font-medium text-white">
                      <Calendar className="w-5 h-5  " />
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

                  {/* Priority */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-lg font-medium text-white">
                      <Flag className="w-5 h-5  " />
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

                  {/* Assign To */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-lg font-medium text-white">
                      <User className="w-5 h-5  " />
                      Assign To
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
                          {teamMembers.length === 0 ? "No team members available" : "Leave unassigned"}
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
                      <div className="flex items-center gap-2 text-sm  ">
                        <User className="w-4 h-4" />
                        <span>Task will be assigned to {teamMembers.find(m => m._id === formData.assignedTo)?.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={loading}
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