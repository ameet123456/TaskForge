import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

const ProjectForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    endDate: "",
    teamId: "",
  });

  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (storedUser?.isAdmin) {
      fetchTeams();
    } else {
      setFormData((prev) => ({
        ...prev,
        teamId: storedUser.teamId, 
      }));
    }
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await API.get("/teams");
      console.log("Fetched Teams:", response.data);
      setTeams(response.data.data || []); 
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/projects", formData);
      if (response.data.success) {
        alert("Project Created Successfully!");
        navigate("/projects");
      } else {
        setError("Project creation failed.");
      }
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Server error while creating project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-8">
      <div className="max-w-[1440px] mx-auto">
        <Breadcrumb />
        
        <div className="max-w-2xl mx-auto mt-8">
          <div className="mb-8">
            <h1 className="text-[40px] font-bold mb-2">Create New Project</h1>
            <p className="text-gray-400 text-lg">Transform your ideas into reality</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-[#2d2d2d] rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-white font-semibold mb-3 text-lg">
                  Project Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  className="w-full bg-[#191818] border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#FF1E00] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block text-white font-semibold mb-3 text-lg">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project"
                  rows="4"
                  className="w-full bg-[#191818] border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[#FF1E00] focus:outline-none transition-colors duration-200 resize-none"
                  required
                ></textarea>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-white font-semibold mb-3 text-lg">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-[#191818] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-[#FF1E00] focus:outline-none transition-colors duration-200"
                  required
                />
              </div>

              {/* Team Selection */}
              {user?.isAdmin ? (
                <div>
                  <label className="block text-white font-semibold mb-3 text-lg">
                    Select Team
                  </label>
                  <select
                    name="teamId"
                    value={formData.teamId}
                    onChange={handleChange}
                    className="w-full bg-[#191818] border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-[#FF1E00] focus:outline-none transition-colors duration-200"
                    required
                  >
                    <option value="">Choose a team</option>
                    {Array.isArray(teams) && teams.length > 0 ? (
                      teams.map((team) => (
                        <option key={team._id} value={team._id} className="bg-[#191818]">
                          {team.name}
                        </option>
                      ))
                    ) : (
                      <option disabled className="bg-[#191818]">Loading teams...</option>
                    )}
                  </select>
                </div>
              ) : (
                <div className="p-4 bg-[#FF1E00]/10 border border-[#FF1E00]/30 rounded-xl">
                  <div className="flex items-center text-[#FF1E00]">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="font-medium">This project will be assigned to your team</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-6 space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="px-8 py-3 text-white font-semibold rounded-xl border border-gray-600 hover:bg-[#191818] transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#FF1E00] hover:bg-[#FF1E00]/80 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Create Project
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

export default ProjectForm;