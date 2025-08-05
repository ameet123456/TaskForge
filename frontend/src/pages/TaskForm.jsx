import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

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
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Create New Task</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {user?.isAdmin && (
          <div>
            <label className="font-medium">Select Team</label>
            <select
              name="teamId"
              value={formData.teamId}
              onChange={handleTeamChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
          </div>
        )}

        {user?.isAdmin && (
          <div>
            <label className="font-medium">Select Project</label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleProjectChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="font-medium">Task Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="font-medium">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="font-medium">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="font-medium">Assign to Team Member</label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;