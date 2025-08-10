import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, FileText, ArrowLeft } from "lucide-react";

const CreateTeamForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teamLead: "",
    members: []
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get("/users"); 
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (e) => {
    const options = e.target.options;
    const selectedMembers = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedMembers.push(options[i].value);
      }
    }
    setFormData((prev) => ({ ...prev, members: selectedMembers }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.description || !formData.teamLead) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await API.post("/teams", formData);
      if (response.data.team) {
        navigate("/teams"); 
      } else {
        setError("Team creation failed.");
      }
    } catch (err) {
      console.error("Error creating team:", err);
      setError(err.response?.data?.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-8">
      <div className="max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/teams")}
            className="w-10 h-10 rounded-full bg-[#2d2d2d] hover:bg-[#FF1E00] flex items-center justify-center transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-[40px] font-bold">Create New Team</h1>
            <p className="text-white/70">Build your dream team and start collaborating</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#2d2d2d] rounded-xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Team Name */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-lg font-medium text-white">
                  <Users className="w-5 h-5 " />
                  Team Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors placeholder-gray-400"
                  placeholder="Enter your team name"
                />
              </div>

              {/* Team Description */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-lg font-medium text-white">
                  <FileText className="w-5 h-5 " />
                  Team Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors placeholder-gray-400 resize-none"
                  placeholder="Describe your team's purpose and goals"
                />
              </div>

              {/* Team Lead Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-lg font-medium text-white">
                  <UserCheck className="w-5 h-5 " />
                  Team Lead
                </label>
                <div className="relative">
                  <select
                    name="teamLead"
                    value={formData.teamLead}
                    onChange={handleChange}
                    className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[#191818]">Select Team Lead</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id} className="bg-[#191818]">
                        {user.name} ({user.email})
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

              {/* Team Members Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-lg font-medium text-white">
                  <Users className="w-5 h-5 " />
                  Team Members
                </label>
                <div className="space-y-2">
                  <select
                    multiple
                    name="members"
                    value={formData.members}
                    onChange={handleMembersChange}
                    className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors min-h-[120px]"
                  >
                    {users.map((user) => (
                      <option 
                        key={user._id} 
                        value={user._id} 
                        className="bg-[#191818] py-2 hover:bg-[#FF1E00]"
                      >
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-400 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Hold Ctrl (Cmd on Mac) to select multiple members
                  </p>
                  {formData.members.length > 0 && (
                    <div className="flex items-center gap-2 text-sm ">
                      <span className="w-2 h-2 rounded-full bg-[#FF1E00]"></span>
                      {formData.members.length} member{formData.members.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-600">
                <button
                  type="button"
                  onClick={() => navigate("/teams")}
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
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Create Team
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

export default CreateTeamForm;