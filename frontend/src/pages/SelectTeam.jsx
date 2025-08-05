import React from "react";
import { useNavigate } from "react-router-dom";

const SelectTeam = () => {
  const navigate = useNavigate();

  const teams = JSON.parse(localStorage.getItem("availableTeams") || "[]");

  const handleSelect = (team) => {
    localStorage.setItem("teamId", team.teamId);
    localStorage.setItem("role", team.role);
    localStorage.setItem("teamName", team.teamName);

    if (team.role === "team_lead") {
      navigate("/projects");
    } else {
      navigate("/tasks");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Select a Team</h2>
      {teams.length === 0 ? (
        <p className="text-center text-red-500">No teams found.</p>
      ) : (
        <ul className="space-y-4">
          {teams.map((team, index) => (
            <li key={index} className="border p-4 rounded-md">
              <p className="text-lg font-semibold">🚀 {team.teamName}</p> 

              <p><strong>Role:</strong> {team.role}</p>
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handleSelect(team)}
              >
                Enter Team
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SelectTeam;
