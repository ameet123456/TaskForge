import React, { useState, useEffect } from "react";
import API from "../api"
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, X, UserCheck, Users } from "lucide-react";

// Simplified Demo User Selection Modal
const DemoUserModal = ({ isOpen, onClose, onSelectUser }) => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const demoUsers = {
    team_lead: {
      email: "puja@tf.com",
      password: "123456",
      role: "Team Lead",
      description: "Manage projects, assign tasks, and oversee team performance",
      icon: <UserCheck className="w-12 h-12" />,
      color: "from-[#FF1E00] to-[#FF6B35]"
    },
    team_member: {
      email: "ashish@tf.com", 
      password: "123456",
      role: "Team Member", 
      description: "View assigned tasks, update progress, and collaborate with team",
      icon: <Users className="w-12 h-12" />,
      color: "from-[#4F46E5] to-[#7C3AED]"
    }
  };

  const handleSelectUser = async (userType) => {
    const user = demoUsers[userType];
    setSelectedRole(userType);
    setLoading(true);
    
    // Simulate a brief loading then auto-login
    setTimeout(() => {
      onSelectUser(user.email, user.password, user.role);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-[#2d2d2d] rounded-2xl p-8 max-w-2xl w-full border border-[#444444] relative animate-slideInScale">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#444444] rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-4 animate-bounce">🚀</div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Experience TaskForge Demo
          </h2>
          <p className="text-gray-400">
            Choose your role to explore the platform
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#FF1E00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Logging you in...</h3>
            <p className="text-gray-400">
              Setting up your demo experience as {demoUsers[selectedRole]?.role}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(demoUsers).map(([key, user]) => (
              <button
                key={key}
                onClick={() => handleSelectUser(key)}
                className="group p-8 rounded-xl border-2 border-[#444444] hover:border-[#FF1E00] hover:bg-[#FF1E00]/10 transition-all duration-300 hover:scale-105 transform text-center"
              >
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${user.color} mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {user.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3 group-hover:text-[#FF1E00] transition-colors">
                  {user.role}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {user.description}
                </p>

                <div className="mt-6 px-4 py-2 bg-[#333333] group-hover:bg-[#FF1E00] rounded-lg transition-colors duration-300">
                  <span className="text-white font-semibold">
                    Start Demo
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Demo includes sample projects and tasks for immediate exploration
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInScale {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-slideInScale {
          animation: slideInScale 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoLoginInProgress, setDemoLoginInProgress] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const AnimatedGrid = () => (
    <div className="absolute inset-0 opacity-3">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(90deg, transparent 49%, rgba(255, 30, 0, 0.1) 50%, transparent 51%), linear-gradient(transparent 49%, rgba(255, 30, 0, 0.1) 50%, transparent 51%)',
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}
      />
    </div>
  );

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("users/login", {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const teams = user.teams;

        if (user.isAdmin) {
          navigate("/teams");
          return;
        }

        if (!teams || teams.length === 0) {
          setError("⚠️ No team membership found.");
          return;
        }

        if (teams.length === 1) {
          const selectedTeam = teams[0];
          localStorage.setItem("teamId", selectedTeam.teamId);
          localStorage.setItem("role", selectedTeam.role);

          if (selectedTeam.role === "team_lead") {
            navigate("/projects");
          } else {
            navigate("/tasks");
          }
        } else {
          localStorage.setItem("availableTeams", JSON.stringify(teams));
          navigate("/select-team");
        }
      } else {
        setError("User data missing from response!");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/api/users/auth/google", "_self");
  };

  // Direct auto-login for demo users
  const handleDemoUserSelection = async (demoEmail, demoPassword, role) => {
    setDemoLoginInProgress(true);
    setShowDemoModal(false);
    
    try {
      // Call your actual API with demo credentials
      const response = await API.post("users/login", {
        email: demoEmail,
        password: demoPassword,
      });

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const teams = user.teams;

        if (teams && teams.length > 0) {
          const selectedTeam = teams[0];
          localStorage.setItem("teamId", selectedTeam.teamId);
          localStorage.setItem("role", selectedTeam.role);

          // Navigate based on role
          if (selectedTeam.role === "team_lead") {
            navigate("/projects");
          } else {
            navigate("/tasks");
          }
        } else {
          setError("Demo user setup incomplete");
        }
      }
    } catch (error) {
      setError("Demo login failed. Please try again.");
    } finally {
      setDemoLoginInProgress(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(parsedUser));
        navigate("/welcome");
      } catch (error) {
        setError("Error processing login. Please try again.");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const demoMode = params.get("demo");

    if (demoMode === "true") {
      setShowDemoModal(true);
    }
  }, [location.search]);

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleManualLogin(e);
    }
  };

  // Show loading screen during demo login
  if (demoLoginInProgress) {
    return (
      <div className="min-h-screen bg-[#191818] text-white flex items-center justify-center px-6 relative overflow-hidden">
        <AnimatedGrid />
        <div className="text-center relative z-10">
          <div className="w-20 h-20 border-4 border-[#FF1E00] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Setting up your demo...</h2>
          <p className="text-gray-400">Please wait while we log you in</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Demo User Selection Modal */}
      <DemoUserModal 
        isOpen={showDemoModal}
        onClose={() => {
          setShowDemoModal(false);
          navigate('/'); // Go back to homepage if modal is closed
        }}
        onSelectUser={handleDemoUserSelection}
      />

      <div className="min-h-screen bg-[#191818] text-white flex items-center justify-center px-6 relative overflow-hidden">
        <AnimatedGrid />
        <div className="relative z-10 w-full max-w-md">

          <div className="text-center mb-8 animate-fadeInUp">
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              TaskForge
            </h1>
            <p className="text-gray-400">Welcome back</p>
          </div>

          <div className="bg-[#2d2d2d] rounded-2xl p-8 border border-[#333333] hover:border-[#444444] transition-all duration-300 animate-slideInUp shadow-2xl">
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="animate-slideInLeft">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className="w-full px-4 py-3 bg-[#191818] border border-[#444444] rounded-lg focus:border-[#FF1E00] focus:ring-1 focus:ring-[#FF1E00] text-white placeholder-gray-500 transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="animate-slideInLeft delay-100">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full px-4 py-3 bg-[#191818] border border-[#444444] rounded-lg focus:border-[#FF1E00] focus:ring-1 focus:ring-[#FF1E00] text-white placeholder-gray-500 transition-all duration-300 pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF1E00] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#FF1E00] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 animate-slideInUp delay-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="my-6 flex items-center animate-fadeInUp delay-300">
              <div className="flex-1 border-t border-[#444444]"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-[#444444]"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full border-2 border-[#333333] hover:border-[#FF1E00] hover:bg-[#FF1E00]/10 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 animate-slideInUp delay-400 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            <div className="mt-6 text-center animate-fadeInUp delay-500">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300"
              >
                ← Back to TaskForge Home
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(50px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .animate-slideInUp {
            animation: slideInUp 0.6s ease-out forwards;
          }
          .animate-slideInLeft {
            animation: slideInLeft 0.6s ease-out forwards;
          }
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
        `}</style>
      </div>
    </>
  );
};

export default Login;