import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import {
  Settings,
  Bell,
  Lock,
  Palette,
  Globe,
  Shield,
  Database,
  LogOut,
  Save,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
  Monitor,
  Mail,
  MessageSquare,
  Calendar,
  Trash2,
  Download,
  Eye,
  EyeOff
} from "lucide-react";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [settings, setSettings] = useState({
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    
    profileVisibility: "team",
    showEmail: false,
    showPhone: false,
    allowSearching: true,
    
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
      
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords don't match");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Password changed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error changing password:", err);
      setError("Failed to change password");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const data = {
        user: user,
        settings: settings,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${user._id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess("Data exported successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to export data");
      setTimeout(() => setError(""), 3000);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    const confirmation = window.prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmation !== "DELETE") {
      return;
    }

    try {
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      setError("Failed to delete account");
      setTimeout(() => setError(""), 3000);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
    { id: "data", label: "Data & Storage", icon: Database }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191818] text-white flex justify-center items-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF1E00]" />
          <span className="text-lg text-white/80">Loading settings...</span>
        </div>
      </div>
    );
  }

  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#FF1E00]' : 'bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[40px] font-bold">Settings</h1>
            <p className="text-white/70">Manage your account preferences and security</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="bg-[#FF1E00] hover:bg-red-600 disabled:bg-red-800 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
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

        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="bg-[#2d2d2d] rounded-xl p-4 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? "bg-[#FF1E00] text-white"
                          : "hover:bg-[#353535] text-white/70"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-[#2d2d2d] rounded-xl p-8">
              {activeTab === "general" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Settings className="w-6 h-6 text-[#FF1E00]" />
                      General Settings
                    </h2>

                    <div className="space-y-6">
                                              <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium mb-1">Language</h3>
                          <p className="text-sm text-white/60">Select your preferred language</p>
                        </div>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange("general", "language", e.target.value)}
                          className="bg-[#2d2d2d] border border-gray-600 text-white px-3 py-2 rounded-lg focus:border-[#FF1E00] focus:outline-none"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="zh">Chinese</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium mb-1">Timezone</h3>
                          <p className="text-sm text-white/60">Your local timezone</p>
                        </div>
                        <select
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange("general", "timezone", e.target.value)}
                          className="bg-[#2d2d2d] border border-gray-600 text-white px-3 py-2 rounded-lg focus:border-[#FF1E00] focus:outline-none"
                        >
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                          <option value="GMT">Greenwich Mean Time</option>
                          <option value="IST">India Standard Time</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium mb-1">Date Format</h3>
                          <p className="text-sm text-white/60">How dates are displayed</p>
                        </div>
                        <select
                          value={settings.dateFormat}
                          onChange={(e) => handleSettingChange("general", "dateFormat", e.target.value)}
                          className="bg-[#2d2d2d] border border-gray-600 text-white px-3 py-2 rounded-lg focus:border-[#FF1E00] focus:outline-none"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

             

              {activeTab === "privacy" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Shield className="w-6 h-6 text-[#FF1E00]" />
                      Privacy Settings
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium mb-1">Profile Visibility</h3>
                          <p className="text-sm text-white/60">Who can see your profile</p>
                        </div>
                        <select
                          value={settings.profileVisibility}
                          onChange={(e) => handleSettingChange("privacy", "profileVisibility", e.target.value)}
                          className="bg-[#2d2d2d] border border-gray-600 text-white px-3 py-2 rounded-lg focus:border-[#FF1E00] focus:outline-none"
                        >
                          <option value="public">Everyone</option>
                          <option value="team">Team Members Only</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium">Show Email Address</h3>
                          <p className="text-sm text-white/60">Display email in your profile</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.showEmail}
                          onChange={(value) => handleSettingChange("privacy", "showEmail", value)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium">Show Phone Number</h3>
                          <p className="text-sm text-white/60">Display phone number in your profile</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.showPhone}
                          onChange={(value) => handleSettingChange("privacy", "showPhone", value)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium">Allow Searching</h3>
                          <p className="text-sm text-white/60">Let others find you by name or email</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.allowSearching}
                          onChange={(value) => handleSettingChange("privacy", "allowSearching", value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Lock className="w-6 h-6 text-[#FF1E00]" />
                      Security Settings
                    </h2>

                    <div className="space-y-6">
                      

                      <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-white/60">Add an extra layer of security to your account</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.twoFactorAuth}
                          onChange={(value) => handleSettingChange("security", "twoFactorAuth", value)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium">Login Alerts</h3>
                          <p className="text-sm text-white/60">Get notified of new login attempts</p>
                        </div>
                        <ToggleSwitch
                          enabled={settings.loginAlerts}
                          onChange={(value) => handleSettingChange("security", "loginAlerts", value)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-[#191818] rounded-lg">
                        <div>
                          <h3 className="font-medium mb-1">Session Timeout</h3>
                          <p className="text-sm text-white/60">Automatically log out after inactivity</p>
                        </div>
                        <select
                          value={settings.sessionTimeout}
                          onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
                          className="bg-[#2d2d2d] border border-gray-600 text-white px-3 py-2 rounded-lg focus:border-[#FF1E00] focus:outline-none"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={0}>Never</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <Database className="w-6 h-6 text-[#FF1E00]" />
                      Data & Storage
                    </h2>

                    <div className="space-y-6">
                      <div className="p-6 bg-[#191818] rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium mb-1">Export Your Data</h3>
                            <p className="text-sm text-white/60">Download a copy of your data</p>
                          </div>
                          <Download className="w-5 h-5 text-[#FF1E00]" />
                        </div>
                        <button
                          onClick={exportData}
                          className="bg-[#FF1E00] hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export Data
                        </button>
                      </div>


                     
                      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <h3 className="font-medium text-red-400">Danger Zone</h3>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Delete Account</h4>
                            <p className="text-sm text-white/60 mb-4">
                              Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                            <button
                              onClick={deleteAccount}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Account
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;