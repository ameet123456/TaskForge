import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { Loader2 } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

const TeamDetails = () => {
  const { teamId } = useParams();
  console.log("teamId from useParams:", teamId);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMemberId, setNewMemberId] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUserOptions(res.data.users);
    } catch (err) {
      console.error("Failed to fetch user list", err);
    }
  };

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await API.get(`/teams/${teamId}`);
        setTeam(res.data.data.team);
        setProjects(res.data.data.projects || []);

        console.log("teamId used for adding member:", teamId);
      } catch (err) {
        console.error("Failed to fetch team", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
    fetchUsers();
  }, [teamId, refreshTrigger]);
  const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const handleAddMember = async () => {
    if (!newMemberId) return alert("Please select a user.");

    try {
      console.log("Sending to:", `/team-members/${teamId}/members`);
      await API.post(`/team-members/${teamId}/members`, {
        userId: newMemberId,
      });

      setNewMemberId("");
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error(
        " Failed to add member:",
        error.response?.data || error.message
      );
      alert("Could not add member.");
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await API.delete(`/team-members/${teamId}/members/${userId}`);
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error("Failed to remove member:", error);
      alert("Could not remove member.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">Loading team...</span>
      </div>
    );
  }

  if (!team) return <p className="text-center text-red-500">Team not found.</p>;

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-4">
      <div className="max-w-[1440px] mx-auto">
        <Breadcrumb/>
        <h2
          className="text-[32px] font-bold leading-[86%] mb-2"
          style={{ fontFamily: "Segoe UI, sans-serif" }}
        >
          {team.name}
        </h2>
        <p className="text-base text-white/80 mb-6 leading-snug">
          {team.description}
        </p>

        <div className="mb-6">
          <p className="text-xl font-semibold mb-2 flex items-center gap-2">
            Team Lead: {team.teamLead?.name || "Not assigned"}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            Members
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {team.members && team.members.length > 0 ? (
              team.members.map((member) => (
                <li
                  key={member._id}
                  className="flex justify-between items-center"
                >
                  <span>{member.name}</span>
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))
            ) : (
              <li>No members found.</li>
            )}
          </ul>
        </div>
        {projects.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 ">
              Projects in this Team
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-[#2d2d2d] rounded-xl p-6 text-white min-h-[255px] flex flex-col justify-between hover:bg-[#FF1E00]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div></div>
                      <span className="text-xs text-white/70 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    </div>

                    <h2
                      className="text-[32px] font-bold leading-[86%] mb-2"
                      style={{ fontFamily: "Segoe UI, sans-serif" }}
                    >
                      {project.name}
                    </h2>

                    <p className="text-base text-white/80 mb-6 leading-snug">
                      {project.description}
                    </p>
                  </div>

                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-base font-medium">
                      <span className="font-semibold">
                        {getDaysLeft(project.endDate)}
                      </span>{" "}
                      Days Left
                    </span>

                    <button
                      onClick={() => navigate(`/projects/${project._id}`)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center transition"
                    >
                      <svg
                        className="w-4 h-4 text-[#FF1E00]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 17L17 7M7 7h10v10"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">
            Add New Member (by User ID)
          </h3>
          <select
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            className="border p-2 rounded w-full mb-2 bg-[#2d2d2d] "
          >
            <option value="">-- Select a user --</option>
            {userOptions.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <button
            onClick={handleAddMember}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
