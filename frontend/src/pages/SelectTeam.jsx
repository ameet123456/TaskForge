import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Inside component

const SelectTeam = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredTeam, setHoveredTeam] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "User"; 
  const [teams, setTeams] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    // Option 1: If backend sends teams via API
    fetch("/api/teams", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch(() => {
        // Option 2: Fallback to localStorage
        const storedTeams = JSON.parse(
          localStorage.getItem("availableTeams") || "[]"
        );
        setTeams(storedTeams);
      });
  }, []);


  const handleSelect = (team) => {
    setSelectedTeam(team);
    setLoading(true);

    // Save to localStorage
    localStorage.setItem("teamId", team.teamId);
    localStorage.setItem("role", team.role);
    localStorage.setItem("teamName", team.teamName);

    // Small delay for animation effect
    setTimeout(() => {
      navigate("/home"); // Instead of projects/tasks directly
      setLoading(false);
    }, 1500);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "team_lead":
        return "bg-yellow-900/30 text-yellow-400 border-yellow-700";
      case "member":
        return "bg-blue-900/30 text-blue-400 border-blue-700";
      case "admin":
        return "bg-[#FF1E00]/20 text-[#FF1E00] border-[#FF1E00]/30";
      default:
        return "bg-gray-900/30 text-gray-400 border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#191818] text-white relative overflow-hidden">
      {/* Background decorative elements */}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 ">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-4xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Welcome, {userName}!
              </h1>
              
            </div>
            <p className="text-xl text-gray-300 mb-2">
              You're part of multiple teams
            </p>
            <p className="text-gray-400">
              Choose which team you'd like to work with today
            </p>
          </div>

          {/* Teams Selection */}
          {teams.length === 0 ? (
            <div className="text-center py-16 animate-fadeInUp delay-300">
              <div className="bg-[#2d2d2d] rounded-2xl p-12 border border-[#333333] max-w-md mx-auto">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-bold mb-2">No Teams Found</h3>
                <p className="text-gray-400 mb-6">
                  It looks like you don't have any team memberships yet.
                </p>
                <button
                  onClick={() =>
                    alert("In a real app, this would navigate to dashboard")
                  }
                  className="px-6 py-3 bg-[#FF1E00] hover:bg-[#e51a00] rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp delay-300">
              {teams.map((team, index) => (
                <div
                key={index}
                className={`group relative rounded-2xl p-6 border-2 transition-all duration-500 cursor-pointer transform hover:scale-105
                  ${
                    selectedTeam?.teamId === team.teamId
                      ? "border-[#FF1E00] bg-[#FF1E00]/10 scale-105 rotate-1"
                      : hoveredTeam === index
                      ? "border-[#555555] -rotate-1 hover:bg-[#FF1E00]"
                      : "border-[#333333] hover:border-[#444444] hover:bg-[#FF1E00]"
                  }
                  ${loading && selectedTeam?.teamId === team.teamId ? "animate-pulse" : ""}
                `}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: `slideInScale 0.8s ease-out ${index * 0.1}s forwards`,
                }}
                onMouseEnter={() => setHoveredTeam(index)}
                onMouseLeave={() => setHoveredTeam(null)}
                onClick={() => !loading && handleSelect(team)}
              >
              
                  {/* Selection indicator */}
                  {selectedTeam?.teamId === team.teamId && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-[#FF1E00] rounded-full flex items-center justify-center animate-ping">
                      <div className="w-3 h-3 bg-[#FF1E00] rounded-full"></div>
                    </div>
                  )}

                  {/* Team content */}
                  <div className="relative z-10">
                    {/* Team header */}
                    <div className="flex flex-col gap-1 mb-4">
                    {/* Team name */}
                      <h3 className="text-2xl font-bold mb-3  transition-colors duration-300">
                      {team.teamName}
                      </h3>
                      <div className="flex items-start justify-between mb-4">
                        <span
                          className={`text-xs px-3 py-1 rounded-full border font-semibold ${getRoleBadgeColor(
                            team.role
                         )}`}
                        >
                          {team.role?.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto space-x-2">                      {/* Team details */}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        Team ID: {team.teamId?.slice(0, 8)}...
                      </div>                      
                      

                    {/* Action button */}
                    <button
                      
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

                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF1E00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}


          {/* Loading overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#2d2d2d] rounded-2xl p-8 border border-[#333333] text-center">
                <div className="w-12 h-12 border-4 border-[#FF1E00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-semibold mb-2">Entering Team...</p>
                <p className="text-gray-400 text-sm">
                  Setting up your workspace
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default SelectTeam;
