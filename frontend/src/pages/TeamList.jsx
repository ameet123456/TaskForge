import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";

import API from "../api";
import { Loader2, Users } from "lucide-react";

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await API.get("/teams");
        if (response.data.success) {
          setTeams(response.data.data);
        } else {
          setError("Failed to fetch teams.");
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Error fetching teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191818] text-white py-4 ">
      <div className="max-w-[1440px] mx-auto">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb />
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[32px] font-bold leading-[86%] mb-2"
              style={{ fontFamily: "Segoe UI, sans-serif" }}
            >
              <span>Team List</span>
            </h2>
            <button
              onClick={() => navigate("/team/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              + Create Team
            </button>
          </div>
          {teams.length === 0 ? (
            <p className="text-gray-500 text-center">No teams found.</p>
          ) : (
            <div className="space-y-6">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className="bg-[#2d2d2d] rounded-xl p-6 text-white flex flex-col justify-between hover:bg-[#FF1E00]"
                >
                  <div className="flex flex-col gap-1 mb-4">
                    <h2
                      className="text-[32px] font-bold leading-[86%] mb-2"
                      style={{ fontFamily: "Segoe UI, sans-serif" }}
                    >
                      {team.name}
                    </h2>
                    <p className="text-base text-white/80 mb-6 leading-snug">
                      {team.description}
                    </p>
                    <div className="flex items-center space-x-2 text-sm ">
                      <span>Lead: {team.teamLead?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto space-x-2">
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg border bg-white shadow-sm w-fit text-sm text-gray-700">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>
                        <strong>{team.members?.length || 0}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/teams/${team._id}`)}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamList;
