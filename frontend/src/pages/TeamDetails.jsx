import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import { 
  Loader2, 
  Users, 
  UserCheck, 
  Plus, 
  Trash2, 
  Calendar,
  Briefcase,
  ArrowRight
} from "lucide-react";
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
  const [addingMember, setAddingMember] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Get current user data
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Check if current user can manage team members - ONLY team members cannot manage
  const canManageMembers = () => {
    if (!currentUser || !team) return false;
    
    // Admin can manage any team
    if (currentUser.isAdmin) return true;
    
    // Team lead can manage their team
    if (team.teamLead && team.teamLead._id === currentUser._id) return true;
    
    // Check if user has team_leader role in their teams
    const userTeams = currentUser.teams || [];
    const isTeamLeader = userTeams.some(userTeam => userTeam.role === 'team_lead');
    if (isTeamLeader) return true;
    
    // Only regular team members (not admin, not team leader) cannot manage
    return false;
  };

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

  const getProjectStatus = (endDate) => {
    const daysLeft = getDaysLeft(endDate);
    if (daysLeft > 0) {
      return {
        status: 'Active',
        color: 'bg-green-500',
        textColor: 'text-green-400'
      };
    } else {
      return {
        status: 'Deactivated',
        color: 'bg-red-500',
        textColor: 'text-red-400'
      };
    }
  };

  const handleAddMember = async () => {
    if (!newMemberId) {
      alert("Please select a user.");
      return;
    }

    setAddingMember(true);
    try {
      console.log("Sending to:", `/team-members/${teamId}/members`);
      await API.post(`/team-members/${teamId}/members`, {
        userId: newMemberId,
      });
      setNewMemberId("");
      setRefreshTrigger((prev) => !prev);
    } catch (error) {
      console.error(
        "Failed to add member:",
        error.response?.data || error.message
      );
      alert("Could not add member.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    
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
      <div className="min-h-screen bg-[#191818] text-white flex justify-center items-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF1E00]" />
          <span className="text-lg text-white/80">Loading team details...</span>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#191818] text-white flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-xl text-red-400">Team not found</p>
          <button
            onClick={() => navigate("/teams")}
            className="mt-4 text-[#FF1E00] hover:text-red-400 transition-colors"
          >
            Go back to teams
          </button>
        </div>
      </div>
    );
  }

  const userCanManage = canManageMembers();

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-4">
      <div className="max-w-[1440px] mx-auto">
        <Breadcrumb />
        
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-[40px] font-bold mb-4">{team.name}</h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-3xl">
                {team.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#2d2d2d] px-4 py-2 rounded-lg">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {team.members?.length || 0} Members
                </span>
              </div>
              {currentUser?.teams && currentUser.teams.length > 1 && (
                <button
                  onClick={() => navigate("/select-team")}
                  className="bg-[#FF1E00] hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <Users className="w-4 h-4" />
                  Switch Team
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#2d2d2d] rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              
              <div>
                <h3 className="text-lg font-semibold mb-1">Team Lead</h3>
                <p className="text-white/70">
                  {team.teamLead?.name || "Not assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Users className="w-7 h-7 " />
              Team Members
            </h2>
          </div>

          {team.members && team.members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {team.members.map((member) => (
                <div
                  key={member._id}
                  className="bg-[#2d2d2d] rounded-lg p-4 flex items-center justify-between hover:bg-[#353535] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full  flex items-center justify-center">
                      <UserCheck className="w-5 h-5 " />
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-white/60">{member.email}</p>
                    </div>
                  </div>
                  {userCanManage && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors group"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#2d2d2d] rounded-xl p-8 text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg">No members found</p>
              <p className="text-gray-500 text-sm mt-1">
                {userCanManage ? "Add team members to start collaborating" : "Team members will appear here"}
              </p>
            </div>
          )}

          {userCanManage && (
            <div className="bg-[#2d2d2d] rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 " />
                Add New Member
              </h3>
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <select
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    className="w-full bg-[#191818] border border-gray-600 text-white p-4 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select a user to add</option>
                    {userOptions
                      .filter(user => !team.members?.some(member => member._id === user._id))
                      .map((user) => (
                        <option key={user._id} value={user._id}>
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
                <button
                  onClick={handleAddMember}
                  disabled={!newMemberId || addingMember}
                  className="bg-[#FF1E00] hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  {addingMember ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Member
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!userCanManage && (
            <div className="bg-[#2d2d2d] rounded-xl p-6 text-center border border-gray-600/50">
              <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-400 font-medium mb-1">Member Management</p>
              <p className="text-gray-500 text-sm">
                Only team leads and administrators can add or remove team members
              </p>
            </div>
          )}
        </div>

        {projects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-[#FF1E00]" />
                Team Projects
              </h2>
              <span className="text-white/60 text-sm">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => {
                const projectStatus = getProjectStatus(project.endDate);
                const daysLeft = getDaysLeft(project.endDate);
                
                return (
                  <div
                    key={project._id}
                    className="bg-[#2d2d2d] rounded-xl p-6 text-white min-h-[280px] flex flex-col justify-between hover:bg-[#FF1E00] transition-colors duration-200 cursor-pointer group"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div></div>
                        <span className={`text-xs text-white/70 flex items-center gap-1 ${projectStatus.textColor}`}>
                          <span className={`w-2 h-2 rounded-full ${projectStatus.color}`}></span>
                          {projectStatus.status}
                        </span>
                      </div>

                      <h3 className="text-[32px] font-bold leading-[86%] mb-4">
                        {project.name}
                      </h3>

                      <p className="text-white/80 leading-relaxed mb-6">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/60" />
                        <span className={`font-medium ${daysLeft < 0 ? 'text-red-400' : ''}`}>
                          {daysLeft >= 0 ? `${daysLeft} Days Left` : `${Math.abs(daysLeft)} Days Overdue`}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-white group-hover:bg-white/90 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-4 h-4 text-[#FF1E00]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetails;