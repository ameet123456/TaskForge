import React, { useState, useEffect } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Team</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Team Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
            placeholder="Enter team name"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Team Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full border p-3 rounded-lg"
            placeholder="Enter team description"
          ></textarea>
        </div>
        <div>
          <label className="block mb-2 font-medium">Select Team Lead</label>
          <select
            name="teamLead"
            value={formData.teamLead}
            onChange={handleChange}
            className="w-full border p-3 rounded-lg"
          >
            <option value="">Select Team Lead</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-medium">Select Team Members</label>
          <select
            multiple
            name="members"
            value={formData.members}
            onChange={handleMembersChange}
            className="w-full border p-3 rounded-lg"
          >
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <small className="text-gray-500">Hold CTRL (or CMD on Mac) to select multiple members.</small>
        </div>
        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Creating..." : "Create Team"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/teams")}
            className="text-gray-700 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeamForm;
