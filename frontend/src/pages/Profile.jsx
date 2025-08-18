import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalProjects: 0
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: ""
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          location: userData.location || "",
          bio: userData.bio || ""
        });
      }
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        API.get("/tasks"),
        API.get("/projects")
      ]);
      
      const tasks = tasksRes.data.data || [];
      const projects = projectsRes.data.projects || [];
      
      setStats({
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.state === "completed").length,
        pendingTasks: tasks.filter(task => task.state === "pending").length,
        totalProjects: projects.length
      });
    } catch (err) {
      setError("Failed to fetch stats");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.put(`/users/${user._id}`, formData);
      
      if (response.data.success) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditMode(false);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Failed to update profile");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      bio: user.bio || ""
    });
    setEditMode(false);
    setError("");
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191818] text-white flex justify-center items-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF1E00]" />
          <span className="text-lg text-white/80">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#191818] text-white flex justify-center items-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-xl text-red-400 mb-4">Profile not found</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#FF1E00] hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[40px] font-bold">My Profile</h1>
            <p className="text-white/70">Manage your personal information and settings</p>
          </div>
          <div className="flex items-center gap-3">
            {user.isAdmin && (
              <span className="bg-[#FF1E00]/10 text-[#FF1E00] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </span>
            )}
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#2d2d2d] rounded-xl p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-[#FF1E00]/20 flex items-center justify-center text-2xl font-bold text-[#FF1E00] mb-4">
                    {getInitials(user.name)}
                  </div>
                  <button className="absolute bottom-4 right-0 w-8 h-8 bg-[#FF1E00] hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                <p className="text-white/60 text-sm">{user.email}</p>
                <p className="text-white/40 text-xs mt-2">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#191818] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-[#FF1E00]" />
                    <span className="text-sm">Total Tasks</span>
                  </div>
                  <span className="font-semibold">{stats.totalTasks}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#191818] rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <span className="font-semibold text-green-400">{stats.completedTasks}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#191818] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-semibold text-yellow-400">{stats.pendingTasks}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#191818] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">Projects</span>
                  </div>
                  <span className="font-semibold text-blue-400">{stats.totalProjects}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#2d2d2d] rounded-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Profile Information</h3>
                <div className="flex items-center gap-3">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="text-white/70 hover:text-white border border-gray-600 hover:border-gray-500 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[#FF1E00] hover:bg-red-600 disabled:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="bg-[#FF1E00] hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <User className="w-4 h-4 text-[#FF1E00]" />
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-[#191818] border border-gray-600 text-white p-3 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-lg p-3 bg-[#191818] rounded-lg">{user.name || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Mail className="w-4 h-4 text-[#FF1E00]" />
                    Email Address
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#191818] border border-gray-600 text-white p-3 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors"
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <p className="text-lg p-3 bg-[#191818] rounded-lg">{user.email || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Phone className="w-4 h-4 text-[#FF1E00]" />
                    Phone Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-[#191818] border border-gray-600 text-white p-3 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-lg p-3 bg-[#191818] rounded-lg">{user.phone || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <MapPin className="w-4 h-4 text-[#FF1E00]" />
                    Location
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-[#191818] border border-gray-600 text-white p-3 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors"
                      placeholder="Enter your location"
                    />
                  ) : (
                    <p className="text-lg p-3 bg-[#191818] rounded-lg">{user.location || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Edit3 className="w-4 h-4 text-[#FF1E00]" />
                    Bio
                  </label>
                  {editMode ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-[#191818] border border-gray-600 text-white p-3 rounded-lg focus:border-[#FF1E00] focus:outline-none transition-colors resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-lg p-3 bg-[#191818] rounded-lg min-h-[100px]">
                      {user.bio || "No bio provided"}
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-600">
                  <h4 className="text-lg font-semibold mb-4">Account Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-[#191818] rounded-lg">
                      <span className="text-sm text-white/80">Account Type</span>
                      <span className="font-medium">{user.isAdmin ? "Administrator" : "User"}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#191818] rounded-lg">
                      <span className="text-sm text-white/80">Member Since</span>
                      <span className="font-medium">{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#191818] rounded-lg">
                      <span className="text-sm text-white/80">Last Login</span>
                      <span className="font-medium">{formatDate(user.lastLogin)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#191818] rounded-lg">
                      <span className="text-sm text-white/80">Status</span>
                      <span className="font-medium text-green-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;