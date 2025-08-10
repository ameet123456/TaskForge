import React, { useState, useEffect } from "react";
import API from "../api"
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Floating particles animation
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#FF1E00] rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  // Animated background grid
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

      console.log("Backend Response:", response.data);

      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        console.log("Received User From Backend:", user);
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
    window.open("http://localhost:5000/user/auth/google", "_self");
  };

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(parsedUser));

        console.log("Stored User (Google Login):", parsedUser);

        navigate("/welcome");
      } catch (error) {
        console.error("Error parsing user data:", error);
        setError("Error processing login. Please try again.");
      }
    }
  }, [navigate]);

  // Handle demo mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const demoMode = params.get("demo");

    if (demoMode === "true") {
      console.log("DEMO MODE ACTIVATED");
      setIsDemo(true);
      setEmail("admin@example.com");
      setPassword("123456");

      // Auto-trigger demo login after a short delay
      setTimeout(() => {
        document.getElementById("demo-login-btn")?.click();
      }, 800);
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

  return (
    <div className="min-h-screen bg-[#191818] text-white flex items-center justify-center px-6 relative overflow-hidden">
      <AnimatedGrid />
      <FloatingParticles />
      
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-[#FF1E00] rounded-full opacity-5 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-[#333333] rounded-full opacity-5 animate-pulse delay-1000"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fadeInUp">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            TaskForge
          </h1>
          <p className="text-gray-400">
            {isDemo ? "Demo Mode - Welcome back!" : "Welcome back"}
          </p>
          {isDemo && (
            <div className="mt-2 px-3 py-1 bg-[#FF1E00]/20 border border-[#FF1E00]/30 rounded-full text-xs text-[#FF1E00] inline-block animate-pulse">
              🚀 Demo mode activated - Auto-filling credentials...
            </div>
          )}
        </div>

        {/* Login Form */}
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="demo-login-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF1E00] hover:bg-[#e51a00] px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed animate-slideInUp delay-200 shadow-lg hover:shadow-xl hover:shadow-[#FF1E00]/25"
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

          {/* Divider */}
          <div className="my-6 flex items-center animate-fadeInUp delay-300">
            <div className="flex-1 border-t border-[#444444]"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-[#444444]"></div>
          </div>

          {/* Google Login Button */}
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

          {/* Back to home */}
          <div className="mt-6 text-center animate-fadeInUp delay-500">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300"
            >
              ← Back to TaskForge Home
            </button>
          </div>
        </div>

        {/* Demo Info */}
        {isDemo && (
          <div className="mt-8 text-center animate-fadeInUp delay-600">
            <p className="text-gray-400 text-sm mb-4">Demo credentials auto-filled:</p>
            <div className="bg-[#2d2d2d] p-4 rounded-lg border border-[#333333] text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Email:</span>
                <span className="text-[#FF1E00] font-mono">admin@example.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Password:</span>
                <span className="text-[#FF1E00] font-mono">123456</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
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
        .delay-600 { animation-delay: 0.6s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
};

export default Login;